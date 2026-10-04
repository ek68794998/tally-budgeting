import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { useCategoryStore } from "@tally/utilities/state/category";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCategories } from "./useCategories";

vi.mock("@tally/utilities/state/category", () => ({
  useCategoryStore: vi.fn(),
}));

const mockUseCategoryStore = vi.mocked(useCategoryStore);

const mockFetchCategories = vi.fn();

const buildStore = (
  overrides: Partial<ReturnType<typeof useCategoryStore>> = {},
) => ({
  categories: [],
  error: null,
  fetch: mockFetchCategories,
  isFetching: false,
  isHydrated: false,
  setCategories: vi.fn(),
  subcategories: [],
  ...overrides,
});

describe("useCategories", () => {
  it("calls fetchCategories on mount when not hydrated and not fetching", () => {
    mockUseCategoryStore.mockReturnValue(buildStore());

    renderHook(() => useCategories());

    expect(mockFetchCategories).toHaveBeenCalledOnce();
  });

  it.each([
    { isFetching: false, isHydrated: true },
    { isFetching: true, isHydrated: false },
    { isFetching: true, isHydrated: true },
  ])("does not call fetchCategories when isHydrated=$isHydrated, isFetching=$isFetching", ({
    isFetching,
    isHydrated,
  }) => {
    mockFetchCategories.mockClear();
    mockUseCategoryStore.mockReturnValue(
      buildStore({ isFetching, isHydrated }),
    );

    renderHook(() => useCategories());

    expect(mockFetchCategories).not.toHaveBeenCalled();
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
    mockUseCategoryStore.mockReturnValue(
      buildStore({ isFetching, isHydrated }),
    );

    const { result } = renderHook(() => useCategories());

    expect(result.current.isLoading).toBe(expected);
  });

  it("returns categories, subcategories, and error from store", () => {
    const categories = [
      mockIncompleteObject<Category>({ id: 1, label: "Food" }),
    ];
    const subcategories = [
      mockIncompleteObject<Subcategory>({ id: 2, label: "Groceries" }),
    ];
    mockUseCategoryStore.mockReturnValue(
      buildStore({
        categories,
        error: "oops",
        isHydrated: true,
        subcategories,
      }),
    );

    const { result } = renderHook(() => useCategories());

    expect(result.current.categories).toBe(categories);
    expect(result.current.subcategories).toBe(subcategories);
    expect(result.current.error).toBe("oops");
  });

  it("returns refetch as fetchCategories from store", () => {
    mockUseCategoryStore.mockReturnValue(buildStore({ isHydrated: true }));

    const { result } = renderHook(() => useCategories());

    expect(result.current.refetch).toBe(mockFetchCategories);
  });
});
