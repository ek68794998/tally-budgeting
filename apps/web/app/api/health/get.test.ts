import { beforeEach, describe, expect, it, vi } from "vitest";
import { pingDatabaseAsync } from "../../storage/healthClient";
import { callRouteAsync } from "../testing/routeTesting";
import { GetHealthRouteAsync } from "./get";

vi.mock("../../storage/healthClient", () => ({
	pingDatabaseAsync: vi.fn(),
}));

vi.mock(
	"../../telemetry/telemetry",
	async () => (await import("../testing/routeTesting")).silentTelemetryModule,
);

describe("GetHealthRouteAsync", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("responds 204 without requiring authentication when the database is reachable", async () => {
		vi.mocked(pingDatabaseAsync).mockResolvedValue();

		const { status } = await callRouteAsync(GetHealthRouteAsync);

		expect(status).toBe(204);
	});

	it("responds 503 when the database times out", async () => {
		vi.mocked(pingDatabaseAsync).mockRejectedValue(
			new Error("Connection terminated due to connection timeout"),
		);

		const { json, status } = await callRouteAsync(GetHealthRouteAsync);

		expect(status).toBe(503);
		expect(json).toMatchObject({ error: { code: "databaseUnavailable" } });
	});
});
