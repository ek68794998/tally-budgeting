import { type Category, type CategoryFields } from "../contracts/category";
import { type CategoryRow } from "../database/categoryRow";

export const convertCategoryRowToCategory = (row: CategoryRow): Category => {
  const { id, label } = row;

  return {
    id,
    label,
  };
};

export const convertCategoryFieldsToCategoryRow = (
  row: CategoryFields,
): Omit<CategoryRow, "id"> => {
  const { label } = row;

  return {
    label,
  };
};

export const convertCategoryToCategoryRow = (
  category: Category,
): CategoryRow => ({
  ...convertCategoryFieldsToCategoryRow(category),
  id: category.id,
});
