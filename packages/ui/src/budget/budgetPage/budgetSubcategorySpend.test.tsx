import {
  buildOneTimeExpenses,
  buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BudgetSubcategorySpend } from "./budgetSubcategorySpend";

vi.mock("../oneTime/oneTimeExpensesDetails", () => ({
  OneTimeExpensesDetails: vi.fn(() => <div data-testid="oneTimeDetails" />),
}));

describe("BudgetSubcategorySpend", () => {
  it.each([
    { amountCents: 100_00, amountPaid: 150, overBudgetChips: 1 },
    { amountCents: 100_00, amountPaid: 50, overBudgetChips: 0 },
    { amountCents: 0, amountPaid: 50, overBudgetChips: 0 },
  ])("shows $overBudgetChips over-budget chip(s) for $amountPaid of $amountCents cents", ({
    amountCents,
    amountPaid,
    overBudgetChips,
  }) => {
    render(
      <BudgetSubcategorySpend
        amountPaid={amountPaid}
        periodEnd={{ month: 3, year: 2025 }}
        subcategory={buildSubcategory({
          budget: { amountCents, frequency: 1, type: "expense" },
          description: "Clothes and shoes",
          label: "Apparel",
        })}
      />,
    );

    expect(screen.getByText("Apparel")).toBeInTheDocument();
    expect(screen.queryAllByText(/over budget/iu)).toHaveLength(
      overBudgetChips,
    );
  });

  it.each([
    { expectedIcons: 0, name: "no breakdown data", oneTime: undefined },
    {
      expectedIcons: 0,
      name: "no one-time transactions",
      oneTime: buildOneTimeExpenses(),
    },
    {
      expectedIcons: 1,
      name: "one-time transactions",
      oneTime: buildOneTimeExpenses({
        totalSpent: 25000,
        transactions: [
          {
            amount: 25000,
            date: "2025-03-03T12:00:00.000Z",
            id: 1,
            merchant: "Dealership",
            subcategoryId: 1,
          },
        ],
      }),
    },
  ])("shows $expectedIcons one-time icon(s) for $name", ({
    expectedIcons,
    oneTime,
  }) => {
    render(
      <BudgetSubcategorySpend
        amountPaid={0}
        oneTime={oneTime}
        periodEnd={{ month: 3, year: 2025 }}
        subcategory={buildSubcategory()}
      />,
    );

    expect(screen.queryAllByLabelText("One-time expenses")).toHaveLength(
      expectedIcons,
    );
  });
});
