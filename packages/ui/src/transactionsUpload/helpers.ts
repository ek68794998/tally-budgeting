import { type PostTransactionsUploadResponse } from "@tally/data-models/contracts/api/postTransactionsUpload";
import { DefaultSubcategoryId } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import z from "zod";

const unprocessedItemSchema = z.record(z.string(), z.string());

export type UnprocessedItem = z.Infer<typeof unprocessedItemSchema>;

export const groupUploadResults = (
	response: PostTransactionsUploadResponse,
) => {
	const itemHeaders: string[] = [];
	const itemsCategorized: Transaction[] = [];
	const itemsUncategorized: Transaction[] = [];
	const itemsFailed: unknown[] = [...response.rowsFailed];
	const itemsIgnored: unknown[] = [...response.rowsIgnored];

	const firstUnprocessedRow = itemsFailed[0] ?? itemsIgnored[0];

	if (firstUnprocessedRow) {
		itemHeaders.push(...Object.keys(firstUnprocessedRow));
	}

	for (const transaction of response.rowsProcessed) {
		if (transaction.subcategoryId === DefaultSubcategoryId) {
			itemsUncategorized.push(transaction);
			continue;
		}

		itemsCategorized.push(transaction);
	}

	return {
		inputCsvHeaders: itemHeaders,
		rowsFailed: itemsFailed,
		rowsIgnored: itemsIgnored,
		transactionsCategorized: itemsCategorized,
		transactionsUncategorized: itemsUncategorized,
	};
};

export const toUnprocessedItems = (rows: unknown[]): UnprocessedItem[] =>
	rows.map((row) => {
		const parsedRow = unprocessedItemSchema.safeParse(row);
		return parsedRow.success ? parsedRow.data : {};
	});

/** Collapses transactions to one entry per merchant, keeping the last one seen. */
export const countTransactionsByMerchant = (
	transactions: Transaction[],
): (Transaction & { count: number })[] => {
	const items: Record<string, Transaction & { count: number }> = {};

	for (const transaction of transactions) {
		const count = items[transaction.merchant]?.count || 0;

		items[transaction.merchant] = {
			...transaction,
			count: count + 1,
		};
	}

	return Object.values(items);
};
