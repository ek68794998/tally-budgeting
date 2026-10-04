import { buildSubcategory } from "@tally/data-models/testing/fixtures";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubcategoryItem } from "./subcategoryItem";

describe("SubcategoryItem", () => {
  it.each([
    { description: "Monthly rent", frequency: 1 },
    { description: "", frequency: 12 },
  ])("renders the subcategory budgeted every $frequency month(s) and its actions", ({
    description,
    frequency,
  }) => {
    const onDelete = vi.fn();
    const onEdit = vi.fn();

    render(
      <SubcategoryItem
        onDelete={onDelete}
        onEdit={onEdit}
        subcategory={buildSubcategory({
          budget: { amountCents: 100_00, frequency, type: "expense" },
          description,
          label: "Rent",
        })}
      />,
    );

    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("Expense")).toBeInTheDocument();
    expect(screen.queryAllByText("Monthly rent")).toHaveLength(
      description ? 1 : 0,
    );

    const [editButton, deleteButton] = screen.getAllByRole("button");
    fireEvent.click(editButton ?? document.body);
    fireEvent.click(deleteButton ?? document.body);

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
  });
});
