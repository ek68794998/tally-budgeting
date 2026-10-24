import { buildOneTimeExpenses } from "@tally/data-models/testing/fixtures";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OneTimeExpensesDetails } from "./oneTimeExpensesDetails";
import { OneTimeExpensesPopover } from "./oneTimeExpensesPopover";
import { OneTimeExpensesSummary } from "./oneTimeExpensesSummary";

vi.mock("./oneTimeExpensesDetails", () => ({
  OneTimeExpensesDetails: vi.fn(() => <div data-testid="details" />),
}));
vi.mock("./oneTimeExpensesSummary", () => ({
  OneTimeExpensesSummary: vi.fn(() => <div data-testid="summary" />),
}));

const buildTransactions = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    amount: 100,
    date: "2025-02-03T12:00:00.000Z",
    id: index + 1,
    merchant: `Merchant ${index + 1}`,
    subcategoryId: 1,
  }));

describe("OneTimeExpensesPopover", () => {
  it.each([
    { count: 1, expectedText: "1 purchase" },
    { count: 3, expectedText: "3 purchases" },
  ])("shows the summary and opens the details from `$expectedText`", async ({
    count,
    expectedText,
  }) => {
    const oneTime = buildOneTimeExpenses({
      totalSpent: 300,
      transactions: buildTransactions(count),
    });

    render(<OneTimeExpensesPopover oneTime={oneTime} />);

    expect(OneTimeExpensesSummary).toHaveBeenCalledWith(
      { totalSpent: 300 },
      undefined,
    );
    expect(screen.queryByTestId("details")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: expectedText }));

    expect(await screen.findByTestId("details")).toBeInTheDocument();
    expect(OneTimeExpensesDetails).toHaveBeenCalledWith({ oneTime }, undefined);
  });
});
