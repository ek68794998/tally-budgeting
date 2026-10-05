import { omitKeys } from "@ekumlin/typescript-toolkit/collections";
import { buildAsset } from "@tally/data-models/testing/fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../testing/routeTesting";
import { DeleteAssetsIdRouteAsync } from "./[id]/delete";
import { PutAssetsIdRouteAsync } from "./[id]/put";
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

  it("POST creates an asset from its fields", async () => {
    const asset = omitKeys(buildAsset(), "id");

    const { status } = await callRouteAsync(PostAssetsRouteAsync, {
      body: { asset },
      method: "POST",
    });

    expect(status).toBe(201);
    expect(client.insertAssetsAsync).toHaveBeenCalledExactlyOnceWith([asset]);
  });

  it.each([
    { asset: { name: "" } },
    { asset: buildAsset() },
  ])("POST rejects %o", async (body) => {
    const { status } = await callRouteAsync(PostAssetsRouteAsync, {
      body,
      method: "POST",
    });

    expect(status).toBe(400);
    expect(client.insertAssetsAsync).not.toHaveBeenCalled();
  });

  it.each([
    { expectedStatus: 200, wasUpdated: true },
    { expectedStatus: 404, wasUpdated: false },
  ])("PUT updates an asset by route id with status $expectedStatus", async ({
    expectedStatus,
    wasUpdated,
  }) => {
    client.updateAssetAsync.mockResolvedValue(wasUpdated);
    const asset = omitKeys(buildAsset(), "id");

    const { status } = await callRouteAsync(PutAssetsIdRouteAsync, {
      body: { asset },
      method: "PUT",
      params: { id: "12" },
    });

    expect(status).toBe(expectedStatus);
    expect(client.updateAssetAsync).toHaveBeenCalledExactlyOnceWith({
      ...asset,
      id: 12,
    });
  });

  it("PUT rejects a non-numeric route id", async () => {
    const { status } = await callRouteAsync(PutAssetsIdRouteAsync, {
      body: { asset: omitKeys(buildAsset(), "id") },
      method: "PUT",
      params: { id: "abc" },
    });

    expect(status).toBe(400);
    expect(client.updateAssetAsync).not.toHaveBeenCalled();
  });

  it("DELETE removes the asset with the route id", async () => {
    const { status } = await callRouteAsync(DeleteAssetsIdRouteAsync, {
      method: "DELETE",
      params: { id: "7" },
    });

    expect(status).toBe(204);
    expect(client.deleteAssetAsync).toHaveBeenCalledWith(7);
  });

  it("DELETE rejects a non-numeric route id", async () => {
    const { json, status } = await callRouteAsync(DeleteAssetsIdRouteAsync, {
      method: "DELETE",
      params: { id: "abc" },
    });

    expect(status).toBe(400);
    expect(json).toMatchObject({ error: { code: "invalidRouteParameters" } });
    expect(client.deleteAssetAsync).not.toHaveBeenCalled();
  });
});
