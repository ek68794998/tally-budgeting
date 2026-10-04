import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLatestData } from "./useLatestData";

interface Props<T> {
  initial: T;
  isLoading: boolean;
  latest: T;
}

describe("useLatestData", () => {
  it("keeps the initial data until new, non-empty data finishes loading", () => {
    const initialProps: Props<number[]> = {
      initial: [1],
      isLoading: true,
      latest: [],
    };
    const { rerender, result } = renderHook(useLatestData<number[]>, {
      initialProps,
    });

    expect(result.current).toEqual([1]);

    rerender({ initial: [1], isLoading: false, latest: [] });
    expect(result.current).toEqual([1]);

    rerender({ initial: [1], isLoading: true, latest: [2] });
    expect(result.current).toEqual([1]);

    rerender({ initial: [1], isLoading: false, latest: [2] });
    expect(result.current).toEqual([2]);
  });

  it("accepts non-array data once loaded", () => {
    const { result } = renderHook(useLatestData<{ value: number } | null>, {
      initialProps: {
        initial: null,
        isLoading: false,
        latest: { value: 3 },
      },
    });

    expect(result.current).toEqual({ value: 3 });
  });
});
