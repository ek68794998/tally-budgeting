import {
  buildCategory,
  buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCategories } from "../../hooks/store/useCategories";
import { MasterDetail } from "../../masterDetail/masterDetail";
import { CategoriesMasterDetail } from "./categoriesMasterDetail";
import { CategoryDetailContent } from "./categoryDetailContent";
import { CategoryListItem } from "./categoryListItem";
import { useCategoryEditModal } from "./hooks/useCategoryEditModal";
import { useCategoryDeleteModal } from "./hooks/useDeleteCategoryModal";
import { useSubcategoryDeleteModal } from "./hooks/useDeleteSubcategoryModal";
import { useSubcategoryEditModal } from "./hooks/useSubcategoryEditModal";
import { SubcategoryActions } from "./subcategoryActions";

vi.mock("../../hooks/store/useCategories", () => ({ useCategories: vi.fn() }));
vi.mock("../../masterDetail/masterDetail", () => ({
  MasterDetail: vi.fn(() => <div data-testid="master-detail" />),
}));
vi.mock("./categoryDetailContent", () => ({
  CategoryDetailContent: vi.fn(() => <div data-testid="detail-content" />),
}));
vi.mock("./categoryListItem", () => ({
  CategoryListItem: vi.fn(() => <div data-testid="list-item" />),
}));
vi.mock("./subcategoryActions", () => ({
  SubcategoryActions: vi.fn(() => <div data-testid="actions" />),
}));
vi.mock("./hooks/useCategoryEditModal", () => ({
  useCategoryEditModal: vi.fn(),
}));
vi.mock("./hooks/useDeleteCategoryModal", () => ({
  useCategoryDeleteModal: vi.fn(),
}));
vi.mock("./hooks/useDeleteSubcategoryModal", () => ({
  useSubcategoryDeleteModal: vi.fn(),
}));
vi.mock("./hooks/useSubcategoryEditModal", () => ({
  useSubcategoryEditModal: vi.fn(),
}));

const createModalHook = (testId: string) => ({
  open: vi.fn(),
  render: vi.fn(() => <div data-testid={testId} />),
});

const createEditModalHook = (testId: string) => ({
  openEdit: vi.fn(),
  openNew: vi.fn(),
  render: vi.fn(() => <div data-testid={testId} />),
});

const modals = {
  categoryDelete: createModalHook("category-delete"),
  categoryEdit: createEditModalHook("category-edit"),
  subcategoryDelete: createModalHook("subcategory-delete"),
  subcategoryEdit: createEditModalHook("subcategory-edit"),
};

const food = buildCategory({ id: 2, label: "Food" });
const housing = buildCategory({ id: 1, label: "Housing" });
const groceries = buildSubcategory({
  categoryId: 2,
  id: 5,
  label: "Groceries",
});

const mockCategories = (isLoading: boolean) =>
  vi.mocked(useCategories).mockReturnValue({
    categories: [housing, food],
    error: null,
    isLoading,
    refetch: vi.fn(),
    subcategories: [groceries, buildSubcategory({ categoryId: 1 })],
  });

const getMasterDetailProps = () => {
  const props = vi.mocked(MasterDetail).mock.lastCall?.[0];

  if (!props) {
    throw new Error("MasterDetail was not rendered.");
  }

  return props;
};

describe("CategoriesMasterDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategories(false);
    vi.mocked(useCategoryDeleteModal).mockReturnValue(modals.categoryDelete);
    vi.mocked(useCategoryEditModal).mockReturnValue(modals.categoryEdit);
    vi.mocked(useSubcategoryDeleteModal).mockReturnValue(
      modals.subcategoryDelete,
    );
    vi.mocked(useSubcategoryEditModal).mockReturnValue(modals.subcategoryEdit);
  });

  it("renders sorted categories with subcategory counts and every modal", () => {
    render(<CategoriesMasterDetail />);

    const { master } = getMasterDetailProps();

    expect(master.items).toEqual([food, housing]);
    expect(master.title).toBe("Categories");
    expect(screen.getByTestId("category-delete")).toBeInTheDocument();
    expect(screen.getByTestId("subcategory-edit")).toBeInTheDocument();

    const onClick = vi.fn();
    render(master.renderItem(food, true, onClick));

    expect(CategoryListItem).toHaveBeenCalledWith(
      { category: food, isSelected: true, onClick, subcategoryCount: 1 },
      undefined,
    );
  });

  it("adds a category from the master actions", () => {
    render(<CategoriesMasterDetail />);
    render(getMasterDetailProps().master.actions);

    fireEvent.click(screen.getByText("New Category"));

    expect(modals.categoryEdit.openNew).toHaveBeenCalledOnce();
    expect(modals.categoryEdit.openEdit).not.toHaveBeenCalled();
  });

  it.each([
    { isLoading: true, query: () => screen.queryByLabelText("Loading") },
    {
      isLoading: false,
      query: () => screen.queryByText(/You have no categories yet/u),
    },
  ])("shows an empty state while loading=$isLoading", ({
    isLoading,
    query,
  }) => {
    mockCategories(isLoading);

    render(<CategoriesMasterDetail />);
    render(getMasterDetailProps().master.emptyState);

    expect(query()).toBeInTheDocument();
  });

  it("wires detail actions and content to the modals", () => {
    render(<CategoriesMasterDetail />);

    const { detail } = getMasterDetailProps();

    expect(detail.title?.(food)).toBe("Food");
    expect(detail.title?.(null)).toBe("");
    expect(detail.content(null)).toBeNull();

    render(
      <>
        {detail.actions?.(food)}
        {detail.content(food)}
      </>,
    );

    const actionProps = vi.mocked(SubcategoryActions).mock.lastCall?.[0];
    actionProps?.onAddSubcategory(food);
    actionProps?.onDeleteCategory(food);
    actionProps?.onEditCategory(food);

    const contentProps = vi.mocked(CategoryDetailContent).mock.lastCall?.[0];
    contentProps?.onDeleteSubcategory(groceries);
    contentProps?.onEditSubcategory(groceries);

    expect(modals.subcategoryEdit.openNew).toHaveBeenCalledExactlyOnceWith(
      food,
    );
    expect(modals.subcategoryEdit.openEdit).toHaveBeenCalledExactlyOnceWith(
      groceries,
    );
    expect(modals.categoryDelete.open).toHaveBeenCalledWith(food);
    expect(modals.categoryEdit.openEdit).toHaveBeenCalledExactlyOnceWith(food);
    expect(modals.subcategoryDelete.open).toHaveBeenCalledWith(groceries);
    expect(contentProps?.subcategories).toHaveLength(2);
  });
});
