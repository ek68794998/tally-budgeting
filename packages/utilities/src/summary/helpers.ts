import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";

export const getTransactionEarnedValue = (
	transaction: Transaction,
	subcategory: Subcategory,
): number =>
	subcategory.budget.type === "income"
		? transaction.type === "credit"
			? transaction.amount
			: -transaction.amount
		: 0;

export const getTransactionSpentValue = (
	transaction: Transaction,
	subcategory: Subcategory,
): number =>
	subcategory.budget.type === "expense"
		? transaction.type === "debit"
			? transaction.amount
			: -transaction.amount
		: 0;
