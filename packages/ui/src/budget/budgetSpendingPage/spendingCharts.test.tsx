import { type GetBudgetSpendingResponse } from "@tally/data-models/contracts/api/getBudgetSpending";
import { buildSubcategory } from "@tally/data-models/testing/fixtures";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DonutChart } from "../../charts/donutChart";
import { useCategories } from "../../hooks/store/useCategories";
import { SpendingAreas } from "./spendingAreas";
import { SpendingChart } from "./spendingChart";

vi.mock("../../charts/donutChart", () => ({
  DonutChart: vi.fn(() => <div data-testid="donut" />),
}));
vi.mock("../../hooks/store/useCategories", () => ({ useCategories: vi.fn() }));

interface ChartCase {
  Component: typeof SpendingAreas;
  expectedData: { name: string; value: number }[];
  name: string;
}

const spendingData: GetBudgetSpendingResponse = {
  spending: [
    { spentCents: 120_00, subcategoryId: 1 },
    { spentCents: 30_00, subcategoryId: 99 },
  ],
  spentOnNeedsCents: 100_00,
  spentOnSavingsCents: 20_00,
  spentOnWantsCents: 30_00,
  success: true,
};

describe.each<ChartCase>([
  {
    Component: SpendingAreas,
    expectedData: [
      { name: "Needs", value: 100 },
      { name: "Wants", value: 30 },
      { name: "Savings", value: 20 },
    ],
    name: "SpendingAreas",
  },
  {
    Component: SpendingChart,
    expectedData: [
      { name: "Rent", value: 120 },
      { name: "", value: 30 },
    ],
    name: "SpendingChart",
  },
])("$name", ({ Component, expectedData }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCategories).mockReturnValue({
      categories: [],
      error: null,
      isLoading: false,
      refetch: vi.fn(),
      subcategories: [buildSubcategory({ id: 1, label: "Rent" })],
    });
  });

  it("charts the spending data", () => {
    render(
      <Component error={null} isLoading={false} spendingData={spendingData} />,
    );

    expect(
      vi.mocked(DonutChart).mock.lastCall?.[0].data.map(({ name, value }) => ({
        name,
        value,
      })),
    ).toEqual(expectedData);
  });

  it.each([
    {
      error: new Error("Server down"),
      expected: "Server down",
      spending: spendingData,
    },
    {
      error: null,
      expected: "There is no spending data for the given period.",
      spending: { ...spendingData, spending: [] },
    },
    {
      error: null,
      expected: "There is no spending data for the given period.",
      spending: undefined,
    },
  ])("shows '$expected' instead of a chart", ({
    error,
    expected,
    spending,
  }) => {
    render(
      <Component error={error} isLoading={false} spendingData={spending} />,
    );

    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(DonutChart).not.toHaveBeenCalled();
  });

  it("shows a spinner while loading", () => {
    render(
      <Component error={null} isLoading={true} spendingData={undefined} />,
    );

    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });
});
