import { BudgetTypes } from "../contracts/budgetType";
import { type Subcategory } from "../contracts/subcategory";
import { type SubcategoryRow } from "../database/subcategoryRow";

export const convertSubcategoryRowToSubcategory = (
	row: SubcategoryRow,
): Subcategory => {
	const { category, description, id, label } = row;

	return {
		budget: {
			amount: row.budgetAmountCents / 100,
			frequency: row.budgetFrequencyMonths,
			type:
				row.budgetType === BudgetTypes.expense
					? "expense"
					: row.budgetType === BudgetTypes.income
						? "income"
						: "neutral",
		},
		categoryId: category,
		description: description || "",
		id,
		label,
	};
};
