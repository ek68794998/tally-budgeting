import { type Category } from "../contracts/category";
import { type CategoryRow } from "../database/categoryRow";

export const convertCategoryRowToCategory = (row: CategoryRow): Category => {
	const { id, label } = row;

	return {
		id,
		label,
	};
};

export const convertCategoryToCategoryRow = (row: Category): CategoryRow => {
	const { id, label } = row;

	return {
		id,
		label,
	};
};
