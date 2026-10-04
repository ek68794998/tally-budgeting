import { buildNetWorthSnapshot } from "@tally/data-models/testing/fixtures";
import { withoutId } from "@tally/utilities/object/withoutId";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../../testing/routeTesting";
import { GetNetWorthSnapshotsRouteAsync } from "./get";
import { PostNetWorthSnapshotsRouteAsync } from "./post";

vi.mock(
	"../../../storage/netWorthSnapshotsClient",
	async () =>
		(await import("../../testing/routeTesting")).storageModules
			.netWorthSnapshots,
);
vi.mock(
	"../../../auth/verifyRequest",
	async () =>
		(await import("../../testing/routeTesting")).authenticatedRequestModule,
);
vi.mock(
	"../../../telemetry/telemetry",
	async () =>
		(await import("../../testing/routeTesting")).silentTelemetryModule,
);

const { netWorthSnapshots: client } = storageMocks;

describe("net worth snapshot routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("GET returns every snapshot", async () => {
		client.getNetWorthSnapshotsAsync.mockResolvedValue([
			buildNetWorthSnapshot(),
		]);

		const { json, status } = await callRouteAsync(
			GetNetWorthSnapshotsRouteAsync,
		);

		expect(status).toBe(200);
		expect(json).toEqual({
			snapshots: [buildNetWorthSnapshot()],
			success: true,
		});
	});

	it("POST normalizes the snapshot date to noon UTC before saving", async () => {
		const snapshot = withoutId(
			buildNetWorthSnapshot({ date: "2025-03-04T23:59:00-08:00" }),
		);

		const { status } = await callRouteAsync(
			PostNetWorthSnapshotsRouteAsync,
			{
				body: { snapshot },
				method: "POST",
			},
		);

		expect(status).toBe(200);
		expect(client.upsertNetWorthSnapshotsAsync).toHaveBeenCalledWith({
			...snapshot,
			date: "2025-03-04T12:00:00Z",
		});
	});

	it("POST rejects a date that cannot be normalized", async () => {
		const { json, status } = await callRouteAsync(
			PostNetWorthSnapshotsRouteAsync,
			{
				body: {
					snapshot: withoutId(
						buildNetWorthSnapshot({ date: "2025-02-30T00:00:00Z" }),
					),
				},
				method: "POST",
			},
		);

		expect(status).toBe(400);
		expect(json).toMatchObject({ error: { code: "invalidRequestBody" } });
		expect(client.upsertNetWorthSnapshotsAsync).not.toHaveBeenCalled();
	});
});
