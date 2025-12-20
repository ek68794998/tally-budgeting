import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { sortAndFlattenCategories } from "./sortAndFlattenCategories";

export const createCategoryMap = (
	categories: Category[],
	subcategories: Subcategory[],
): Record<number, [Category, Subcategory[]]> => {
	const flattenedCategories = sortAndFlattenCategories(
		categories,
		subcategories,
	);
	const categoryMap: Record<number, [Category, Subcategory[]]> = {};

	return flattenedCategories.reduce((acc, [cat, subcats]) => {
		acc[cat.id] = [cat, subcats];
		return acc;
	}, categoryMap);
};
