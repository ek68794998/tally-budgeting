import { beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseToolError } from "../../storage/databaseTools";
import { callRouteAsync, storageMocks } from "../testing/routeTesting";
import { GetDatabaseBackupRouteAsync } from "./backup/get";
import { PostDatabaseDropRouteAsync } from "./drop/post";
import { PostDatabaseRestoreRouteAsync } from "./restore/post";

const mocks = vi.hoisted(() => ({
	runPgDumpAsync: vi.fn<(path: string) => Promise<void>>(),
}));

vi.mock(
	"../../storage/databaseAdminClient",
	async () =>
		(await import("../testing/routeTesting")).storageModules.databaseAdmin,
);
vi.mock("../../storage/databaseTools", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../storage/databaseTools")>()),
	runPgDumpAsync: mocks.runPgDumpAsync,
}));
vi.mock(
	"../../auth/verifyRequest",
	async () =>
		(await import("../testing/routeTesting")).authenticatedRequestModule,
);
vi.mock(
	"../../telemetry/telemetry",
	async () => (await import("../testing/routeTesting")).silentTelemetryModule,
);

const buildRestoreForm = (confirm?: string) => {
	const formData = new FormData();

	if (confirm) {
		formData.set("confirm", confirm);
	}

	formData.set("file", new File(["dump"], "backup.dump"));

	return formData;
};

const { databaseAdmin } = storageMocks;

describe("database routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("GET backup streams the dump as a dated attachment", async () => {
		mocks.runPgDumpAsync.mockImplementation(async (path) => {
			const { writeFile } = await import("node:fs/promises");
			await writeFile(path, "PGDMP");
		});

		const response = await GetDatabaseBackupRouteAsync(
			new (await import("next/server")).NextRequest(
				"http://localhost/api/database/backup",
				{ headers: { host: "localhost" } },
			),
			{ params: Promise.resolve({}) },
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-disposition")).toMatch(
			/^attachment; filename="tally-\d{4}-\d{2}-\d{2}\.dump"$/,
		);
		await expect(response.text()).resolves.toBe("PGDMP");
	});

	it("GET backup reports pg_dump failures", async () => {
		mocks.runPgDumpAsync.mockRejectedValue(
			new DatabaseToolError("pg_dump", "boom"),
		);

		const { json, status } = await callRouteAsync(
			GetDatabaseBackupRouteAsync,
		);

		expect(status).toBe(500);
		expect(json).toMatchObject({
			error: { code: "databaseBackupFailed", params: { stderr: "boom" } },
		});
	});

	it("POST restore restores an uploaded file once confirmed", async () => {
		databaseAdmin.restoreAsync.mockResolvedValue();

		const { status } = await callRouteAsync(PostDatabaseRestoreRouteAsync, {
			formData: buildRestoreForm("restore"),
			method: "POST",
		});

		expect(status).toBe(200);
		expect(databaseAdmin.restoreAsync).toHaveBeenCalledOnce();
	});

	it("POST restore surfaces pg_restore stderr", async () => {
		databaseAdmin.restoreAsync.mockRejectedValue(
			new DatabaseToolError("pg_restore", "bad archive"),
		);

		const { json, status } = await callRouteAsync(
			PostDatabaseRestoreRouteAsync,
			{ formData: buildRestoreForm("restore"), method: "POST" },
		);

		expect(status).toBe(500);
		expect(json).toMatchObject({
			error: {
				code: "databaseRestoreFailed",
				params: { stderr: "bad archive" },
			},
		});
	});

	it("POST drop wipes the database once confirmed", async () => {
		databaseAdmin.dropAllDataAsync.mockResolvedValue();

		const { status } = await callRouteAsync(PostDatabaseDropRouteAsync, {
			body: { confirm: "delete" },
			method: "POST",
		});

		expect(status).toBe(200);
		expect(databaseAdmin.dropAllDataAsync).toHaveBeenCalledOnce();
	});

	it.each([
		{
			name: "restore without the confirm word",
			options: { formData: buildRestoreForm(), method: "POST" },
			route: PostDatabaseRestoreRouteAsync,
		},
		{
			name: "restore with the wrong confirm word",
			options: { formData: buildRestoreForm("delete"), method: "POST" },
			route: PostDatabaseRestoreRouteAsync,
		},
		{
			name: "drop without a body",
			options: { method: "POST" },
			route: PostDatabaseDropRouteAsync,
		},
		{
			name: "drop with the wrong confirm word",
			options: { body: { confirm: "restore" }, method: "POST" },
			route: PostDatabaseDropRouteAsync,
		},
	])("rejects $name", async ({ options, route }) => {
		const { status } = await callRouteAsync(route, options);

		expect(status).toBe(400);
		expect(databaseAdmin.restoreAsync).not.toHaveBeenCalled();
		expect(databaseAdmin.dropAllDataAsync).not.toHaveBeenCalled();
	});

	it("rejects cross-site requests", async () => {
		const { status } = await callRouteAsync(PostDatabaseDropRouteAsync, {
			body: { confirm: "delete" },
			headers: [["origin", "https://evil.example"]],
			method: "POST",
		});

		expect(status).toBe(403);
		expect(databaseAdmin.dropAllDataAsync).not.toHaveBeenCalled();
	});
});
