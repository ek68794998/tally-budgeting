import { type Subcategory } from "../contracts/subcategory";
import { type SubcategoryRow } from "../database/subcategoryRow";

export const convertSubcategoryRowToSubcategory = (
	row: SubcategoryRow,
): Subcategory => {
	const {
		budget_amount_cents: budgetAmountCents,
		budget_frequency_months: budgetFrequencyMonths,
		budget_type: budgetType,
		category,
		description,
		id,
		label,
	} = row;

	return {
		budget: {
			amountCents: budgetAmountCents,
			frequency: budgetFrequencyMonths,
			type: budgetType,
		},
		categoryId: category,
		description: description || "",
		id,
		label,
	};
};
