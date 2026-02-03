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
		pct_needs: percentNeeds,
		pct_savings: percentSavings,
	} = row;

	return {
		budget: {
			amountCents: Number(budgetAmountCents),
			frequency: budgetFrequencyMonths,
			type: budgetType,
		},
		categoryId: category,
		description: description || "",
		id,
		label,
		percentNeeds,
		percentSavings,
	};
};

export const convertSubcategoryToSubcategoryRow = (
	row: Subcategory,
): SubcategoryRow => {
	const {
		budget: {
			amountCents: budgetAmountCents,
			frequency: budgetFrequencyMonths,
			type: budgetType,
		},
		categoryId: category,
		description,
		id,
		label,
		percentNeeds,
		percentSavings,
	} = row;

	return {
		/* eslint-disable @typescript-eslint/naming-convention */
		budget_amount_cents: String(budgetAmountCents),
		budget_frequency_months: budgetFrequencyMonths,
		budget_type: budgetType,
		category,
		description: description || "",
		id,
		label,
		pct_needs: percentNeeds,
		pct_savings: percentSavings,
		/* eslint-enable @typescript-eslint/naming-convention */
	};
};
