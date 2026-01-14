import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { Dollars } from "../financial/dollars";

export const getTransactionEarnedValue = (
	transaction: Transaction,
	subcategory: Subcategory,
): number =>
	Dollars.fromCents(
		subcategory.budget.type === "income"
			? transaction.type === "credit"
				? transaction.amountCents
				: -transaction.amountCents
			: 0,
	);

export const getTransactionSpentValue = (
	transaction: Transaction,
	subcategory: Subcategory,
): number =>
	Dollars.fromCents(
		subcategory.budget.type === "expense"
			? transaction.type === "debit"
				? transaction.amountCents
				: -transaction.amountCents
			: 0,
	);
