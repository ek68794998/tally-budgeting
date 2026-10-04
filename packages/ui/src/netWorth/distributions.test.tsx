import { buildAsset } from "@tally/data-models/testing/fixtures";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DonutChart } from "../charts/donutChart";
import { AssetDistribution } from "./assetDistribution";
import { LiabilityDistribution } from "./liabilityDistribution";

vi.mock("../charts/donutChart", () => ({
  DonutChart: vi.fn(() => <div data-testid="donut" />),
}));

const assets = [
  buildAsset({ type: "fixed_asset", valueCents: 300_000_00 }),
  buildAsset({ type: "liquid_asset", valueCents: 10_000_00 }),
  buildAsset({ type: "liquid_asset", valueCents: 5_000_00 }),
  buildAsset({ type: "personal_asset", valueCents: 2_000_00 }),
  buildAsset({ type: "long_term_liability", valueCents: 200_000_00 }),
  buildAsset({ type: "short_term_liability", valueCents: 1_000_00 }),
];

const getChartProps = () => vi.mocked(DonutChart).mock.lastCall?.[0];

describe("asset and liability distributions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      Component: AssetDistribution,
      expectedTitle: "Asset Distribution",
      expectedValues: [300_000, 15_000, 2_000],
    },
    {
      Component: LiabilityDistribution,
      expectedTitle: "Liability Distribution",
      expectedValues: [200_000, 1_000],
    },
  ])("charts totals per type for $expectedTitle", ({
    Component,
    expectedTitle,
    expectedValues,
  }) => {
    render(<Component assets={assets} />);

    expect(getChartProps()?.title).toBe(expectedTitle);
    expect(getChartProps()?.data.map(({ value }) => value)).toEqual(
      expectedValues,
    );
    expect(getChartProps()?.formatValue?.(1234.5)).toBe("$1,235");
  });
});
