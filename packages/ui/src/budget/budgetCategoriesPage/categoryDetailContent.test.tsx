import { DefaultSubcategoryId } from "@tally/data-models/contracts/subcategory";
import {
  buildCategory,
  buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryDetailContent } from "./categoryDetailContent";
import { SubcategoryItem } from "./subcategoryItem";

vi.mock("./subcategoryItem", () => ({
  SubcategoryItem: vi.fn(
    ({ subcategory }: { subcategory: { label: string } }) => (
      <div data-testid="subcategory">{subcategory.label}</div>
    ),
  ),
}));

const category = buildCategory({ id: 1 });

describe("CategoryDetailContent", () => {
  it("lists the category's subcategories sorted and wires their actions", () => {
    const onDeleteSubcategory = vi.fn();
    const onEditSubcategory = vi.fn();
    const utilities = buildSubcategory({ id: 2, label: "Utilities" });

    render(
      <CategoryDetailContent
        category={category}
        onDeleteSubcategory={onDeleteSubcategory}
        onEditSubcategory={onEditSubcategory}
        subcategories={[
          utilities,
          buildSubcategory({ id: 1, label: "Rent" }),
          buildSubcategory({ categoryId: 2, id: 3, label: "Other" }),
        ]}
      />,
    );

    expect(
      screen.getAllByTestId("subcategory").map((item) => item.textContent),
    ).toEqual(["Rent", "Utilities"]);

    const utilitiesProps = vi.mocked(SubcategoryItem).mock.lastCall?.[0];
    utilitiesProps?.onEdit?.();
    utilitiesProps?.onDelete?.();

    expect(onEditSubcategory).toHaveBeenCalledWith(utilities);
    expect(onDeleteSubcategory).toHaveBeenCalledWith(utilities);
  });

  it("passes no actions to the default subcategory", () => {
    render(
      <CategoryDetailContent
        category={category}
        onDeleteSubcategory={vi.fn()}
        onEditSubcategory={vi.fn()}
        subcategories={[buildSubcategory({ id: DefaultSubcategoryId })]}
      />,
    );

    const props = vi.mocked(SubcategoryItem).mock.lastCall?.[0];

    expect(props?.onEdit).toBeUndefined();
    expect(props?.onDelete).toBeUndefined();
  });

  it("shows an empty state without subcategories", () => {
    render(
      <CategoryDetailContent
        category={category}
        onDeleteSubcategory={vi.fn()}
        onEditSubcategory={vi.fn()}
        subcategories={[]}
      />,
    );

    expect(
      screen.getByText(/There are no subcategories here yet/u),
    ).toBeInTheDocument();
  });
});
