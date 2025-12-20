import { type Transaction } from "../contracts/transaction";
import { TransactionDirections } from "../contracts/transactionDirection";
import { type TransactionRow } from "../database/transactionRow";

export const convertTransactionToTransactionRow = (
	transaction: Transaction,
): TransactionRow => {
	const {
		accountId,
		amount,
		categoryId,
		date,
		id,
		merchant,
		notes,
		subcategoryId,
		type,
	} = transaction;

	const dateValue = new Date(date);
	dateValue.setUTCHours(12, 0, 0, 0);
	const dateIso = dateValue.toISOString();

	return {
		accountId,
		amountCents: Math.abs(Math.round(amount * 100)),
		categoryId,
		dateIso,
		direction: TransactionDirections[type],
		id,
		merchant,
		notes: notes || null,
		subcategoryId,
	};
};

export const convertTransactionRowToTransaction = (
	row: TransactionRow,
): Transaction => {
	const {
		accountId,
		amountCents,
		categoryId,
		dateIso,
		direction,
		id,
		merchant,
		notes,
		subcategoryId,
	} = row;

	return {
		accountId,
		amount: Math.abs(amountCents / 100.0),
		categoryId,
		date: dateIso,
		id,
		merchant,
		notes: notes ?? undefined,
		subcategoryId,
		type: direction === TransactionDirections.credit ? "credit" : "debit",
	};
};
