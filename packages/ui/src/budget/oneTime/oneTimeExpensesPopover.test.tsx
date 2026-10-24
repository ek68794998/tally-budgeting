import { buildOneTimeExpenses } from "@tally/data-models/testing/fixtures";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OneTimeExpensesDetails } from "./oneTimeExpensesDetails";
import { OneTimeExpensesPopover } from "./oneTimeExpensesPopover";

vi.mock("./oneTimeExpensesDetails", () => ({
  OneTimeExpensesDetails: vi.fn(() => <div data-testid="details" />),
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
    {
      count: 1,
      expectedLink: "one-time expense",
      expectedText: "Plus $300 as a one-time expense",
    },
    {
      count: 3,
      expectedLink: "3 one-time expenses",
      expectedText: "Plus $300 across 3 one-time expenses",
    },
  ])("shows `$expectedText` and opens the details from its link", async ({
    count,
    expectedLink,
    expectedText,
  }) => {
    const oneTime = buildOneTimeExpenses({
      totalSpent: 299.6,
      transactions: buildTransactions(count),
    });

    const { container } = render(<OneTimeExpensesPopover oneTime={oneTime} />);

    expect(container).toHaveTextContent(expectedText);
    expect(screen.getByText("$300").tagName).toBe("B");
    expect(screen.queryByTestId("details")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: expectedLink }));

    expect(await screen.findByTestId("details")).toBeInTheDocument();
    expect(OneTimeExpensesDetails).toHaveBeenCalledWith({ oneTime }, undefined);
  });
});
