import {
  buildAsset,
  buildNetWorthSnapshot,
} from "@tally/data-models/testing/fixtures";
import { AssetsList } from "@tally/ui/assetsPage/assetsList";
import { NetWorthOverview } from "@tally/ui/netWorth/netWorthOverview";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { storageMocks } from "../../api/testing/routeTesting";
import AssetsPage from "./page";

vi.mock("@tally/ui/assetsPage/assetsList", () => ({
  AssetsList: vi.fn(() => <div data-testid="assets-list" />),
}));
vi.mock("@tally/ui/netWorth/netWorthOverview", () => ({
  NetWorthOverview: vi.fn(() => <div data-testid="net-worth" />),
}));
vi.mock(
  "../../storage/assetsClient",
  async () =>
    (await import("../../api/testing/routeTesting")).storageModules.assets,
);
vi.mock(
  "../../storage/netWorthSnapshotsClient",
  async () =>
    (await import("../../api/testing/routeTesting")).storageModules
      .netWorthSnapshots,
);

describe("AssetsPage", () => {
  it("loads assets and snapshots on the server and passes them to the views", async () => {
    const assets = [buildAsset()];
    const netWorthSnapshots = [buildNetWorthSnapshot()];
    storageMocks.assets.getAssetsAsync.mockResolvedValue(assets);
    storageMocks.netWorthSnapshots.getNetWorthSnapshotsAsync.mockResolvedValue(
      netWorthSnapshots,
    );

    render(await AssetsPage({}));

    expect(vi.mocked(NetWorthOverview).mock.lastCall?.[0]).toEqual({
      initialData: { assets, netWorthSnapshots },
    });
    expect(vi.mocked(AssetsList).mock.lastCall?.[0]).toEqual({
      initialData: { assets },
    });
  });
});
