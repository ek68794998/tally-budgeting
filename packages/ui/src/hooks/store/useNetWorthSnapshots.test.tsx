import { dangerouslyMockPartial } from "@ekumlin/typescript-toolkit/testing";
import { type NetWorthSnapshot } from "@tally/data-models/contracts/netWorthSnapshot";
import { useNetWorthSnapshotStore } from "@tally/utilities/state/netWorthSnapshot";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useNetWorthSnapshots } from "./useNetWorthSnapshots";

vi.mock("@tally/utilities/state/netWorthSnapshot", () => ({
  useNetWorthSnapshotStore: vi.fn(),
}));

const mockUseNetWorthSnapshotStore = vi.mocked(useNetWorthSnapshotStore);

const mockFetchSnapshots = vi.fn();

const buildStore = (
  overrides: Partial<ReturnType<typeof useNetWorthSnapshotStore>> = {},
) => ({
  error: null,
  fetch: mockFetchSnapshots,
  isFetching: false,
  isHydrated: false,
  setSnapshots: vi.fn(),
  snapshots: [],
  ...overrides,
});

describe("useNetWorthSnapshots", () => {
  it("calls fetchSnapshots on mount when not hydrated and not fetching", () => {
    mockUseNetWorthSnapshotStore.mockReturnValue(buildStore());

    renderHook(() => useNetWorthSnapshots());

    expect(mockFetchSnapshots).toHaveBeenCalledOnce();
  });

  it.each([
    { isFetching: false, isHydrated: true },
    { isFetching: true, isHydrated: false },
    { isFetching: true, isHydrated: true },
  ])("does not call fetchSnapshots when isHydrated=$isHydrated, isFetching=$isFetching", ({
    isFetching,
    isHydrated,
  }) => {
    mockFetchSnapshots.mockClear();
    mockUseNetWorthSnapshotStore.mockReturnValue(
      buildStore({ isFetching, isHydrated }),
    );

    renderHook(() => useNetWorthSnapshots());

    expect(mockFetchSnapshots).not.toHaveBeenCalled();
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
    mockUseNetWorthSnapshotStore.mockReturnValue(
      buildStore({ isFetching, isHydrated }),
    );

    const { result } = renderHook(() => useNetWorthSnapshots());

    expect(result.current.isLoading).toBe(expected);
  });

  it("returns snapshots and error from store", () => {
    const snapshots = [dangerouslyMockPartial<NetWorthSnapshot>({ id: 1 })];
    mockUseNetWorthSnapshotStore.mockReturnValue(
      buildStore({ error: "oops", isHydrated: true, snapshots }),
    );

    const { result } = renderHook(() => useNetWorthSnapshots());

    expect(result.current.snapshots).toBe(snapshots);
    expect(result.current.error).toBe("oops");
  });

  it("returns refetch as fetchSnapshots from store", () => {
    mockUseNetWorthSnapshotStore.mockReturnValue(
      buildStore({ isHydrated: true }),
    );

    const { result } = renderHook(() => useNetWorthSnapshots());

    expect(result.current.refetch).toBe(mockFetchSnapshots);
  });
});
