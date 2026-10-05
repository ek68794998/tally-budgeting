import { omitKeys } from "@ekumlin/typescript-toolkit/collections";
import { dangerouslyMockPartial } from "@ekumlin/typescript-toolkit/testing";
import { buildAsset } from "@tally/data-models/testing/fixtures";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmationModal } from "../common/confirmationModal";
import { ModalDefaultAsset } from "../common/modalDefault";
import { useDeleteAsset } from "../hooks/api/useDeleteAsset";
import { usePostAsset } from "../hooks/api/usePostAsset";
import { usePutAsset } from "../hooks/api/usePutAsset";
import { useAssets } from "../hooks/store/useAssets";
import { AssetCard } from "./assetCard";
import { AssetEditModal } from "./assetEditModal";
import { AssetsTable } from "./assetsTable";
import { AssetsTableControls } from "./assetsTableControls";

vi.mock("../common/confirmationModal", () => ({
  ConfirmationModal: vi.fn(() => <div data-testid="confirmation-modal" />),
}));
vi.mock("../hooks/api/useDeleteAsset", () => ({ useDeleteAsset: vi.fn() }));
vi.mock("../hooks/api/usePostAsset", () => ({ usePostAsset: vi.fn() }));
vi.mock("../hooks/api/usePutAsset", () => ({ usePutAsset: vi.fn() }));
vi.mock("../hooks/store/useAssets", () => ({ useAssets: vi.fn() }));
vi.mock("./assetCard", () => ({
  AssetCard: vi.fn(() => <div data-testid="asset-card" />),
}));
vi.mock("./assetEditModal", () => ({
  AssetEditModal: vi.fn(() => <div data-testid="asset-edit-modal" />),
}));
vi.mock("./assetsTableControls", () => ({
  AssetsTableControls: vi.fn(() => <div data-testid="controls" />),
}));

const deleteAssetAsync = vi.fn(() => Promise.resolve({}));
const postAssetAsync = vi.fn(() => Promise.resolve({ success: true }));
const putAssetAsync = vi.fn(() => Promise.resolve({ success: true }));
const refetch = vi.fn(() => Promise.resolve());

const checking = buildAsset({ id: 1, name: "Checking" });
const savings = buildAsset({ id: 2, name: "Savings" });
const oldCard = buildAsset({ active: false, id: 3, name: "Amex" });

const getCardProps = () =>
  vi.mocked(AssetCard).mock.calls.map(([props]) => props);
const lastEditModalProps = () => vi.mocked(AssetEditModal).mock.lastCall?.[0];
const lastConfirmationProps = () =>
  vi.mocked(ConfirmationModal).mock.lastCall?.[0];

describe("AssetsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAssets).mockReturnValue(
      dangerouslyMockPartial<ReturnType<typeof useAssets>>({ refetch }),
    );
    vi.mocked(useDeleteAsset).mockReturnValue({ deleteAssetAsync });
    vi.mocked(usePostAsset).mockReturnValue({ postAssetAsync });
    vi.mocked(usePutAsset).mockReturnValue({ putAssetAsync });
  });

  it("lists active assets first, alphabetically, and filters by name", () => {
    render(<AssetsTable assets={[savings, oldCard, checking]} />);

    expect(getCardProps().map(({ asset }) => asset.name)).toEqual([
      "Checking",
      "Savings",
      "Amex",
    ]);

    vi.mocked(AssetCard).mockClear();
    act(() => {
      vi.mocked(AssetsTableControls).mock.lastCall?.[0].onFilterChange("sav");
    });

    expect(getCardProps().map(({ asset }) => asset.name)).toEqual(["Savings"]);
  });

  it.each([
    {
      expectedAsset: ModalDefaultAsset,
      expectedSave: () =>
        expect(postAssetAsync).toHaveBeenCalledExactlyOnceWith(
          omitKeys(ModalDefaultAsset, "id"),
        ),
      isNew: true,
      name: "creates a new",
      open: () =>
        vi.mocked(AssetsTableControls).mock.lastCall?.[0].onNewAsset(),
      unusedMock: putAssetAsync,
    },
    {
      expectedAsset: checking,
      expectedSave: () =>
        expect(putAssetAsync).toHaveBeenCalledExactlyOnceWith(checking),
      isNew: false,
      name: "updates an existing",
      open: () => getCardProps()[0]?.onEdit(),
      unusedMock: postAssetAsync,
    },
  ])("opens the editor and $name asset", async ({
    expectedAsset,
    expectedSave,
    isNew,
    open,
    unusedMock,
  }) => {
    render(<AssetsTable assets={[checking]} />);

    act(() => {
      open();
    });

    expect(lastEditModalProps()).toMatchObject({
      asset: expectedAsset,
      isNew,
      modalState: { isOpen: true },
    });

    await act(
      () =>
        lastEditModalProps()?.onSaveAsync(expectedAsset) ?? Promise.resolve(),
    );

    expectedSave();
    expect(unusedMock).not.toHaveBeenCalled();
    expect(refetch).toHaveBeenCalledOnce();
    expect(lastEditModalProps()?.asset).toBeNull();
    expect(lastEditModalProps()?.modalState.isOpen).toBe(false);
  });

  it("doesn't open the editor when deleting after creating an asset", async () => {
    render(<AssetsTable assets={[checking]} />);

    act(() => {
      vi.mocked(AssetsTableControls).mock.lastCall?.[0].onNewAsset();
    });
    await act(
      () =>
        lastEditModalProps()?.onSaveAsync(ModalDefaultAsset) ??
        Promise.resolve(),
    );
    act(() => {
      getCardProps()[0]?.onDelete();
    });

    expect(lastEditModalProps()?.asset).toBeNull();
    expect(lastConfirmationProps()?.modalState.isOpen).toBe(true);
  });

  it("toggles an asset's active state", async () => {
    render(<AssetsTable assets={[checking]} />);

    await act(async () => {
      getCardProps()[0]?.onSetActive(false);
      await Promise.resolve();
    });

    expect(putAssetAsync).toHaveBeenCalledExactlyOnceWith({
      ...checking,
      active: false,
    });
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("confirms deletion of the chosen asset and requires one", async () => {
    render(<AssetsTable assets={[checking]} />);

    await expect(lastConfirmationProps()?.onConfirmAsync()).rejects.toThrow(
      "Asset to delete must be defined",
    );

    act(() => {
      getCardProps()[0]?.onDelete();
    });

    expect(lastConfirmationProps()?.modalState.isOpen).toBe(true);

    await act(
      () => lastConfirmationProps()?.onConfirmAsync() ?? Promise.resolve(),
    );

    expect(deleteAssetAsync).toHaveBeenCalledWith(1);
    expect(refetch).toHaveBeenCalledOnce();
  });
});
