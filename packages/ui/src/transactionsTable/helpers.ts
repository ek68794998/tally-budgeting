import { type Asset } from "@tally/data-models/contracts/asset";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { DateTime } from "luxon";
import { formatCurrency } from "../format";
import { type TransactionTableData } from "./types";

interface TransactionsTableConversionData {
	accounts: Asset[];
	locale: string;
	subcategories: Subcategory[];
}

const convertTransactionToTableData = (
	transaction: Transaction,
	{ accounts, locale, subcategories }: TransactionsTableConversionData,
): TransactionTableData => ({
	account: accounts.find((account) => account.id === transaction.accountId)
		?.name,
	amount: formatCurrency(transaction.amount, {
		showCents: true,
	}),
	date: DateTime.fromISO(transaction.date).toLocaleString(
		DateTime.DATE_FULL,
		{ locale },
	),
	id: transaction.id,
	merchant: transaction.merchant,
	notes: transaction.notes,
	subcategory: subcategories.find(
		(subcategory) => subcategory.id === transaction.subcategoryId,
	)?.label,
	type: transaction.type,
});

export const getTransactionsTableData = (
	transactions: Transaction[],
	conversionData: TransactionsTableConversionData,
): TransactionTableData[] =>
	transactions.map((transaction) =>
		convertTransactionToTableData(transaction, conversionData),
	);
