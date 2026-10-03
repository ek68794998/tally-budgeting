import { Migrator } from "kysely";
import { afterEach, describe, expect, it, vi } from "vitest";
import { telemetry } from "../telemetry/telemetry";
import { migrateToLatestAsync } from "./migrate";

vi.mock("./database", () => ({ getDatabase: () => ({}) }));
vi.mock("../telemetry/telemetry", () => {
	const logger = { error: vi.fn(), info: vi.fn() };
	return { telemetry: () => logger };
});

describe("migrateToLatestAsync", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
	});

	it("logs each applied migration", async () => {
		vi.spyOn(Migrator.prototype, "migrateToLatest").mockResolvedValue({
			results: [
				{
					direction: "Up",
					migrationName: "0001_initial",
					status: "Success",
				},
			],
		});

		await migrateToLatestAsync();

		expect(telemetry().info).toHaveBeenCalledWith(
			"DATABASE_MIGRATION_RESULT",
			{
				direction: "Up",
				migrationName: "0001_initial",
				status: "Success",
			},
		);
		expect(telemetry().error).not.toHaveBeenCalled();
	});

	it("does nothing when there are no migrations to run", async () => {
		vi.spyOn(Migrator.prototype, "migrateToLatest").mockResolvedValue({
			results: [],
		});

		await migrateToLatestAsync();

		expect(telemetry().info).not.toHaveBeenCalled();
		expect(telemetry().error).not.toHaveBeenCalled();
	});

	it("logs and rethrows with the cause on failure", async () => {
		const cause = new Error("boom");
		vi.spyOn(Migrator.prototype, "migrateToLatest").mockResolvedValue({
			error: cause,
			results: [
				{
					direction: "Up",
					migrationName: "0001_initial",
					status: "Error",
				},
			],
		});

		await expect(migrateToLatestAsync()).rejects.toMatchObject({
			cause,
			message: "Database migration failed.",
		});
		expect(telemetry().error).toHaveBeenCalledWith(
			"DATABASE_MIGRATION_FAILED",
			{ direction: "Up", migrationName: "0001_initial" },
		);
		expect(telemetry().error).toHaveBeenCalledWith(
			"DATABASE_MIGRATION_ABORTED",
			{ error: cause },
		);
	});
});
