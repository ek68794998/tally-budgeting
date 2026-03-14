import { type GetBudgetSpendingResponse } from "@tally/data-models/contracts/api/getBudgetSpending";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";

interface BudgetSpendingInput {
	subcategories: Subcategory[];
	transactions: Transaction[];
}

interface BudgetSpendingData {
	spending: GetBudgetSpendingResponse["spending"];
	spentOnNeedsCents: number;
	spentOnSavingsCents: number;
	spentOnWantsCents: number;
}

export const calculateBudgetSpending = (
	input: BudgetSpendingInput,
): BudgetSpendingData => {
	const { subcategories, transactions } = input;

	const subcategoryMap = new Map<number, Subcategory>(
		subcategories.map((s) => [s.id, s]),
	);

	const spendingBySubcategory: Record<number, number> = {};
	let incomeCents = 0;
	let spentOnNeedsCents = 0;
	let spentOnSavingsCents = 0;
	let spentOnWantsCents = 0;

	for (const transaction of transactions) {
		const { amountCents, subcategoryId } = transaction;
		const subcategory = subcategoryMap.get(subcategoryId);

		if (!subcategory) {
			continue;
		}

		if (subcategory.budget.type === "neutral") {
			continue;
		}

		if (subcategory.budget.type === "income") {
			incomeCents += amountCents;
		}

		const percentSavings = subcategory.percentSavings / 100.0;
		spentOnSavingsCents += percentSavings * amountCents;

		if (subcategory.budget.type !== "expense") {
			continue;
		}

		const percentNeeds = subcategory.percentNeeds / 100.0;
		const percentWants = 1.0 - percentSavings - percentNeeds;

		spentOnNeedsCents += percentNeeds * amountCents;
		spentOnWantsCents += percentWants * amountCents;

		spendingBySubcategory[subcategoryId] =
			(spendingBySubcategory[subcategoryId] ?? 0) + amountCents;
	}

	const spending: GetBudgetSpendingResponse["spending"] = Object.entries(
		spendingBySubcategory,
	).map(([subcategoryId, spentCents]) => ({
		spentCents,
		subcategoryId: Number(subcategoryId),
	}));

	spending.sort((a, b) => b.spentCents - a.spentCents);

	const notSpentCents = Math.max(
		0,
		incomeCents -
			spentOnNeedsCents -
			spentOnSavingsCents -
			spentOnWantsCents,
	);

	return {
		spending,
		spentOnNeedsCents: Math.round(spentOnNeedsCents),
		spentOnSavingsCents: Math.round(spentOnSavingsCents + notSpentCents),
		spentOnWantsCents: Math.round(spentOnWantsCents),
	};
};
