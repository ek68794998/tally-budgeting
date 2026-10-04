import { buildTransaction } from "@tally/data-models/testing/fixtures";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionsUploadResultTransactionRow } from "./transactionsUploadResultTransactionRow";

describe("TransactionsUploadResultTransactionRow", () => {
  it.each([
    { count: 1, expectedChip: "$25.00" },
    { count: 3, expectedChip: "3" },
  ])("shows '$expectedChip' for $count transaction(s) and creates a rule", ({
    count,
    expectedChip,
  }) => {
    const onCreateRule = vi.fn();

    render(
      <TransactionsUploadResultTransactionRow
        count={count}
        onCreateRule={onCreateRule}
        transaction={buildTransaction()}
      />,
    );

    expect(screen.getByText(expectedChip)).toBeInTheDocument();
    expect(screen.getByText("Coffee Shop")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Auto-categorize"));

    expect(onCreateRule).toHaveBeenCalledOnce();
  });
});
