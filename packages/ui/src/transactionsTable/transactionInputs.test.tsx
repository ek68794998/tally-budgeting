import { Select } from "@heroui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoreDropdown } from "../moreDropdown/moreDropdown";
import { buildSelection } from "../testing/heroUi";
import { TransactionEditDirectionButtons } from "./transactionEditDirectionButtons";
import { TransactionHappinessSelect } from "./transactionHappinessSelect";
import { TransactionRowDropdown } from "./transactionRowDropdown";

vi.mock("@heroui/react", async (importOriginal) => {
  const { withHeroUiStubs } = await import("../testing/heroUi.js");
  return withHeroUiStubs(importOriginal);
});
vi.mock("../moreDropdown/moreDropdown", () => ({
  MoreDropdown: vi.fn(() => <div data-testid="more-dropdown" />),
}));

describe("TransactionEditDirectionButtons", () => {
  it("shows expense first and reports the chosen direction", () => {
    const onChange = vi.fn();
    render(
      <TransactionEditDirectionButtons direction="debit" onChange={onChange} />,
    );

    const [expense, income] = screen.getAllByRole("button");

    expect(expense).toHaveTextContent("Expense");
    expect(income).toHaveTextContent("Income");

    fireEvent.click(screen.getByText("Income"));

    expect(onChange).toHaveBeenCalledWith("credit");
  });
});

describe("TransactionHappinessSelect", () => {
  it.each([
    { expected: 3, key: "3" },
    { expected: 2, key: "" },
  ])("reports happiness $expected for key '$key'", ({ expected, key }) => {
    const onChange = vi.fn();
    render(<TransactionHappinessSelect onChange={onChange} value={1} />);

    const props = vi.mocked(Select).mock.lastCall?.[0];

    expect(props?.selectedKeys).toEqual(["1"]);
    expect(screen.getByText("Not Worth It")).toBeInTheDocument();

    props?.onSelectionChange?.(buildSelection(key));

    expect(onChange).toHaveBeenCalledWith(expected);
  });

  it("renders the selected label, defaulting to neutral", () => {
    render(<TransactionHappinessSelect onChange={vi.fn()} value={2} />);

    const renderValue = vi.mocked(Select).mock.lastCall?.[0].renderValue;

    expect(renderValue?.([])).toBe("Neutral");
  });
});

describe("TransactionRowDropdown", () => {
  it("offers edit, duplicate, and delete", () => {
    const handlers = {
      onDelete: vi.fn(),
      onDuplicate: vi.fn(),
      onEdit: vi.fn(),
    };
    render(<TransactionRowDropdown {...handlers} />);

    const entries = vi.mocked(MoreDropdown).mock.lastCall?.[0].entries ?? [];

    expect(entries.map(({ key }) => key)).toEqual([
      "edit",
      "duplicate",
      "delete",
    ]);

    for (const entry of entries) {
      if ("action" in entry) {
        entry.action();
      }
    }

    expect(handlers.onEdit).toHaveBeenCalledOnce();
    expect(handlers.onDuplicate).toHaveBeenCalledOnce();
    expect(handlers.onDelete).toHaveBeenCalledOnce();
  });
});
