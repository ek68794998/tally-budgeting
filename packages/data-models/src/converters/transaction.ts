import {
	type Transaction,
	type TransactionFields,
} from "../contracts/transaction";
import { type SubcategoryRow } from "../database/subcategoryRow";
import { type TxnRow } from "../database/txnRow";

export const convertTransactionFieldsToTxnRow = (
	transaction: TransactionFields,
): Omit<TxnRow, "id"> => {
	const {
		accountId,
		amountCents,
		date,
		happiness,
		merchant,
		notes,
		subcategoryId,
		type,
	} = transaction;

	const dateValue = new Date(date);
	dateValue.setUTCHours(12, 0, 0, 0);

	return {
		account: accountId ?? null,
		amount_cents: String(amountCents), // eslint-disable-line @typescript-eslint/naming-convention
		date: dateValue,
		direction: type,
		happiness,
		merchant,
		notes: notes || null,
		subcategory: subcategoryId,
	};
};

export const convertTransactionToTxnRow = (
	transaction: Transaction,
): TxnRow => ({
	...convertTransactionFieldsToTxnRow(transaction),
	id: transaction.id,
});

export const convertTxnRowToTransaction = (
	row: TxnRow & SubcategoryRow,
): Transaction => {
	const {
		account,
		amount_cents: amountCents,
		category,
		date,
		direction,
		happiness,
		id,
		merchant,
		notes,
		subcategory,
	} = row;

	return {
		accountId: account ?? undefined,
		amountCents: Number(amountCents),
		categoryId: category,
		date: date.toISOString(),
		happiness,
		id,
		merchant,
		notes: notes || "",
		subcategoryId: subcategory,
		type: direction,
	};
};
