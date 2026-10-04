import { buildCategory } from "@tally/data-models/testing/fixtures";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubcategoryActions } from "./subcategoryActions";

vi.mock("@heroui/react", async (importOriginal) => {
  const { withHeroUiStubs } = await import("../../testing/heroUi.js");
  return withHeroUiStubs(importOriginal);
});

describe("SubcategoryActions", () => {
  it("adds a subcategory, edits, or deletes the category", () => {
    const category = buildCategory();
    const handlers = {
      onAddSubcategory: vi.fn(),
      onDeleteCategory: vi.fn(),
      onEditCategory: vi.fn(),
    };

    render(<SubcategoryActions category={category} {...handlers} />);

    fireEvent.click(screen.getByText("New Subcategory"));
    fireEvent.click(
      document.querySelector(".tabler-icon-edit")?.closest("button") ??
        document.body,
    );
    fireEvent.click(screen.getByTestId("dropdown-item"));

    expect(handlers.onAddSubcategory).toHaveBeenCalledWith(category);
    expect(handlers.onEditCategory).toHaveBeenCalledWith(category);
    expect(handlers.onDeleteCategory).toHaveBeenCalledWith(category);
  });
});
