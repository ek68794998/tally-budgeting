import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSelectionInputValue } from "./useSelectionInputValue";

describe("useSelectionInputValue", () => {
  it("starts with the selected label and tracks typed text", () => {
    const { result } = renderHook(() => useSelectionInputValue("Coffee"));

    expect(result.current.inputValue).toBe("Coffee");
    expect(result.current.isShowingSelection).toBe(true);

    act(() => {
      result.current.setInputValue("gro");
    });

    expect(result.current.inputValue).toBe("gro");
    expect(result.current.isShowingSelection).toBe(false);
  });

  it.each([
    { expected: "Coffee", label: undefined },
    { expected: "Rent", label: "Rent" },
  ])("resets the input to $expected", ({ expected, label }) => {
    const { result } = renderHook(() => useSelectionInputValue("Coffee"));

    act(() => {
      result.current.setInputValue("gro");
    });
    act(() => {
      result.current.resetInputValue(label);
    });

    expect(result.current.inputValue).toBe(expected);
  });

  it("follows the selected label when it changes", () => {
    const { rerender, result } = renderHook(
      ({ label }) => useSelectionInputValue(label),
      { initialProps: { label: "" } },
    );

    act(() => {
      result.current.setInputValue("gro");
    });
    rerender({ label: "Rent" });

    expect(result.current.inputValue).toBe("Rent");
    expect(result.current.isShowingSelection).toBe(true);
  });
});
