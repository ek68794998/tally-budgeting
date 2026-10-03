import { type SharedSelection } from "@heroui/react";
import { type Asset } from "@tally/data-models/contracts/asset";
import {
	DefaultSubcategoryId,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { Dollars } from "@tally/utilities/financial/dollars";
import { buildODataLiteFilter } from "@tally/utilities/oData/build";
import { type ODataLiteFilterExpression } from "@tally/utilities/oData/types";
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
	amount: formatCurrency(Dollars.fromCents(transaction.amountCents), {
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

interface TransactionsFilterInput {
	accountIds: SharedSelection;
	searchValue: string;
	subcategoryIds: SharedSelection;
}

export const isSelectionFilterActive = (filter: SharedSelection) =>
	filter !== "all" && filter.size > 0;

export const buildTransactionsFilter = ({
	accountIds,
	searchValue,
	subcategoryIds,
}: TransactionsFilterInput): string => {
	const filterExpressions: ODataLiteFilterExpression[] = [];
	const searchString = searchValue.trim();

	if (searchString) {
		filterExpressions.push({
			field: "merchant",
			operator: "like",
			value: searchString,
		});
	}

	if (isSelectionFilterActive(accountIds)) {
		filterExpressions.push({
			field: "account",
			operator: "in",
			value: Array.from(accountIds).join(","),
		});
	}

	if (isSelectionFilterActive(subcategoryIds)) {
		filterExpressions.push({
			field: "subcategory",
			operator: "in",
			value: Array.from(subcategoryIds).join(","),
		});
	}

	return buildODataLiteFilter(filterExpressions);
};

/** Sorts by label, keeping the default subcategory first. */
export const sortSubcategoriesForSelect = (
	subcategories: Subcategory[],
): Subcategory[] =>
	subcategories.slice(0).sort((a, b) => {
		if (a.id === DefaultSubcategoryId) {
			return -1;
		}

		if (b.id === DefaultSubcategoryId) {
			return 1;
		}

		return a.label.localeCompare(b.label);
	});
