import { buildAsset } from "@tally/data-models/testing/fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../testing/routeTesting";
import { DeleteAssetsIdRouteAsync } from "./[id]/delete";
import { GetAssetsRouteAsync } from "./get";
import { PostAssetsRouteAsync } from "./post";

vi.mock(
	"../../storage/assetsClient",
	async () => (await import("../testing/routeTesting")).storageModules.assets,
);
vi.mock(
	"../../auth/verifyRequest",
	async () =>
		(await import("../testing/routeTesting")).authenticatedRequestModule,
);
vi.mock(
	"../../telemetry/telemetry",
	async () => (await import("../testing/routeTesting")).silentTelemetryModule,
);

const { assets: client } = storageMocks;

describe("assets routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("GET returns every asset", async () => {
		const assets = [buildAsset()];
		client.getAssetsAsync.mockResolvedValue(assets);

		const { json, status } = await callRouteAsync(GetAssetsRouteAsync);

		expect(status).toBe(200);
		expect(json).toEqual({ assets, success: true });
	});

	it.each([
		{
			action: "inserts",
			id: 0,
			isList: true,
			method: client.insertAssetsAsync,
		},
		{
			action: "updates",
			id: 4,
			isList: false,
			method: client.updateAssetAsync,
		},
	])("POST $action an asset with id $id", async ({ id, isList, method }) => {
		const asset = buildAsset({ id });

		const { status } = await callRouteAsync(PostAssetsRouteAsync, {
			body: { asset },
			method: "POST",
		});

		expect(status).toBe(200);
		expect(method).toHaveBeenCalledExactlyOnceWith(
			isList ? [asset] : asset,
		);
	});

	it("POST rejects an invalid asset", async () => {
		const { status } = await callRouteAsync(PostAssetsRouteAsync, {
			body: { asset: { name: "" } },
			method: "POST",
		});

		expect(status).toBe(400);
		expect(client.insertAssetsAsync).not.toHaveBeenCalled();
	});

	it("DELETE removes the asset with the route id", async () => {
		const { status } = await callRouteAsync(DeleteAssetsIdRouteAsync, {
			method: "DELETE",
			params: { id: "7" },
		});

		expect(status).toBe(204);
		expect(client.deleteAssetAsync).toHaveBeenCalledWith(7);
	});
});
