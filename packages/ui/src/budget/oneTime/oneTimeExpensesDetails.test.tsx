import {
  buildOneTimeExpenses,
  buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCategories } from "../../hooks/store/useCategories";
import { OneTimeExpensesDetails } from "./oneTimeExpensesDetails";
import { OneTimeExpensesSummary } from "./oneTimeExpensesSummary";

vi.mock("../../hooks/store/useCategories", () => ({ useCategories: vi.fn() }));
vi.mock("./oneTimeExpensesSummary", () => ({
  OneTimeExpensesSummary: vi.fn(() => <div data-testid="summary" />),
}));

const oneTime = buildOneTimeExpenses({
  totalSpent: 34600,
  transactions: [
    {
      amount: 35000,
      date: "2025-02-03T12:00:00.000Z",
      id: 2,
      merchant: "A Very Long Dealership Name That Should Truncate",
      subcategoryId: 7,
    },
    {
      amount: -400,
      date: "2025-01-20T12:00:00.000Z",
      id: 5,
      merchant: "Refund",
      subcategoryId: 99,
    },
  ],
});

describe("OneTimeExpensesDetails", () => {
  beforeEach(() => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [],
      error: null,
      isLoading: false,
      refetch: vi.fn(),
      subcategories: [buildSubcategory({ id: 7, label: "Vehicles" })],
    });
  });

  it("renders the summary and a row per transaction", () => {
    render(<OneTimeExpensesDetails oneTime={oneTime} />);

    expect(OneTimeExpensesSummary).toHaveBeenCalledWith(
      { totalSpent: 34600 },
      undefined,
    );
    expect(screen.getByText("Feb 3, 2025 · Vehicles")).toBeInTheDocument();
    expect(screen.getByText("$35,000")).toBeInTheDocument();
    expect(screen.getByText("Jan 20, 2025")).toBeInTheDocument();
    expect(screen.getByText("-$400")).toBeInTheDocument();
  });

  it.each([
    {
      expectedHref: "/transactions?filter=id+eq+2",
      merchant: "A Very Long Dealership Name That Should Truncate",
    },
    { expectedHref: "/transactions?filter=id+eq+5", merchant: "Refund" },
  ])("links $merchant to its transaction in a new tab", ({
    expectedHref,
    merchant,
  }) => {
    render(<OneTimeExpensesDetails oneTime={oneTime} />);

    const link = screen.getByText(merchant).closest("a");

    expect(link).toHaveAttribute("href", expectedHref);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveAttribute("title", merchant);
    expect(link).toHaveClass("truncate");
  });
});
