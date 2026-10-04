import { type Asset } from "@tally/data-models/contracts/asset";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { useAssetStore } from "@tally/utilities/state/asset";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAssets } from "./useAssets";

vi.mock("@tally/utilities/state/asset", () => ({
  useAssetStore: vi.fn(),
}));

const mockUseAssetStore = vi.mocked(useAssetStore);

const mockFetchAssets = vi.fn();

const buildStore = (
  overrides: Partial<ReturnType<typeof useAssetStore>> = {},
) => ({
  assets: [],
  error: null,
  fetch: mockFetchAssets,
  isFetching: false,
  isHydrated: false,
  setAssets: vi.fn(),
  ...overrides,
});

describe("useAssets", () => {
  it("calls fetchAssets on mount when not hydrated and not fetching", () => {
    mockUseAssetStore.mockReturnValue(buildStore());

    renderHook(() => useAssets());

    expect(mockFetchAssets).toHaveBeenCalledOnce();
  });

  it.each([
    { isFetching: false, isHydrated: true },
    { isFetching: true, isHydrated: false },
    { isFetching: true, isHydrated: true },
  ])("does not call fetchAssets when isHydrated=$isHydrated, isFetching=$isFetching", ({
    isFetching,
    isHydrated,
  }) => {
    mockFetchAssets.mockClear();
    mockUseAssetStore.mockReturnValue(buildStore({ isFetching, isHydrated }));

    renderHook(() => useAssets());

    expect(mockFetchAssets).not.toHaveBeenCalled();
  });

  it.each([
    { expected: true, isFetching: false, isHydrated: false },
    { expected: true, isFetching: true, isHydrated: true },
    { expected: false, isFetching: false, isHydrated: true },
  ])("returns isLoading=$expected when isHydrated=$isHydrated, isFetching=$isFetching", ({
    expected,
    isFetching,
    isHydrated,
  }) => {
    mockUseAssetStore.mockReturnValue(buildStore({ isFetching, isHydrated }));

    const { result } = renderHook(() => useAssets());

    expect(result.current.isLoading).toBe(expected);
  });

  it("returns assets and error from store", () => {
    const assets = [mockIncompleteObject<Asset>({ id: 1, name: "Checking" })];
    mockUseAssetStore.mockReturnValue(
      buildStore({ assets, error: "oops", isHydrated: true }),
    );

    const { result } = renderHook(() => useAssets());

    expect(result.current.assets).toBe(assets);
    expect(result.current.error).toBe("oops");
  });

  it("returns refetch as fetchAssets from store", () => {
    mockUseAssetStore.mockReturnValue(buildStore({ isHydrated: true }));

    const { result } = renderHook(() => useAssets());

    expect(result.current.refetch).toBe(mockFetchAssets);
  });
});
