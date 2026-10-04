import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";

export const sortAndFlattenCategories = (
  categories: Category[],
  subcategories: Subcategory[],
) => {
  const mappedCategories: [Category, Subcategory[]][] = categories.map(
    (category) => {
      const categorySubcategories = subcategories
        .filter((sub) => sub.categoryId === category.id)
        .sort((a, b) => a.label.localeCompare(b.label));

      return [category, categorySubcategories];
    },
  );

  return mappedCategories.sort(([a], [b]) => a.label.localeCompare(b.label));
};
