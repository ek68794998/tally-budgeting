import { type ActionItems } from "@tally/data-models/contracts/api/getBudgetSummary";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BudgetActionItems } from "./budgetActionItems";

vi.mock("./budgetActionItemsSection", () => ({
  BudgetActionItemsSection: vi.fn(() => <div data-testid="section" />),
}));

const budgetChange = (currentSpent: number, subcategoryId: number) => ({
  budgeted: 100,
  currentSpent,
  periodMonths: 1,
  previousSpent: 100,
  subcategoryId,
  type: "budgetChange" as const,
});

const data: ActionItems = {
  aboveAverage: [
    {
      budgetTotal: 1200,
      monthlyAverage: 100,
      remaining: 400,
      spentThisMonth: 800,
      spentThisPeriod: 800,
      subcategoryId: 1,
      type: "aboveAverage",
    },
  ],
  improved: [budgetChange(50, 2)],
  overBudget: [
    {
      budgeted: 1,
      frequency: 1,
      spent: 2,
      subcategoryId: 3,
      type: "overBudget",
    },
  ],
  worsened: [budgetChange(150, 4), budgetChange(160, 5)],
};

describe("BudgetActionItems", () => {
  it("renders a section per non-empty item set", () => {
    render(
      <BudgetActionItems data={data} periodEnd={{ month: 3, year: 2025 }} />,
    );

    for (const title of [
      "Over Budget",
      "Above Average Spend",
      "New Overages",
      "Back on Track",
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("skips empty item sets", () => {
    render(
      <BudgetActionItems
        data={{ ...data, aboveAverage: [], improved: [], worsened: [] }}
        periodEnd={{ month: 3, year: 2025 }}
      />,
    );

    expect(screen.getByText("Over Budget")).toBeInTheDocument();
    expect(screen.queryByText("Back on Track")).toBeNull();
  });
});
