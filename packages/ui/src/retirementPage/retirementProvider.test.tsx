import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { getDefaultRetirementCalculatorInputs } from "./helpers";
import { RetirementProvider, useRetirementContext } from "./retirementProvider";

const storageKey = "retirement-calculator-inputs";

const renderRetirementContext = () =>
  renderHook(useRetirementContext, { wrapper: RetirementProvider });

describe("RetirementProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts from the defaults and calculates data through life expectancy", () => {
    const { result } = renderRetirementContext();
    const defaults = getDefaultRetirementCalculatorInputs();

    expect(result.current.inputs).toEqual(defaults);
    expect(result.current.calculatedData.dataByYear.at(-1)?.age).toBe(
      defaults.lifeExpectancy,
    );
  });

  it("recalculates and persists updated inputs", () => {
    const { result } = renderRetirementContext();
    const updated = {
      ...getDefaultRetirementCalculatorInputs(),
      currentAge: 60,
      lifeExpectancy: 70,
    };

    act(() => {
      result.current.setInputs(updated);
    });

    expect(result.current.inputs).toEqual(updated);
    expect(result.current.calculatedData.dataByYear[0]?.age).toBe(60);
    expect(JSON.parse(localStorage.getItem(storageKey) ?? "null")).toEqual(
      updated,
    );
  });

  it("restores previously saved inputs", () => {
    const saved = {
      ...getDefaultRetirementCalculatorInputs(),
      currentAge: 40,
    };
    localStorage.setItem(storageKey, JSON.stringify(saved));

    const { result } = renderRetirementContext();

    expect(result.current.inputs).toEqual(saved);
  });

  it("requires a provider", () => {
    expect(() => renderHook(useRetirementContext)).toThrow(
      "useRetirementContext must be used within a RetirementProvider",
    );
  });
});
