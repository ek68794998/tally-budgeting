import { type PostTransactionsUploadResponse } from "@tally/data-models/contracts/api/postTransactionsUpload";
import { DefaultSubcategoryId } from "@tally/data-models/contracts/subcategory";
import { type TransactionFields } from "@tally/data-models/contracts/transaction";
import z from "zod";

const unprocessedItemSchema = z.record(z.string(), z.string());

export type UnprocessedItem = z.Infer<typeof unprocessedItemSchema>;

const toUnprocessedItem = (row: unknown): UnprocessedItem => {
  const parsedRow = unprocessedItemSchema.safeParse(row);
  return parsedRow.success ? parsedRow.data : {};
};

/** Groups an upload's results, converting each failed `[message, row]` result into its row with an error column. */
export const groupUploadResults = (
  response: PostTransactionsUploadResponse,
  errorColumnLabel: string,
) => {
  const transactionsCategorized: TransactionFields[] = [];
  const transactionsUncategorized: TransactionFields[] = [];

  for (const transaction of response.rowsProcessed) {
    if (transaction.subcategoryId === DefaultSubcategoryId) {
      transactionsUncategorized.push(transaction);
      continue;
    }

    transactionsCategorized.push(transaction);
  }

  return {
    rowsFailed: response.rowsFailed.map(([message, row]) => ({
      [errorColumnLabel]: message,
      ...toUnprocessedItem(row),
    })),
    rowsIgnored: response.rowsIgnored.map(toUnprocessedItem),
    transactionsCategorized,
    transactionsUncategorized,
  };
};

export const getUnprocessedItemHeaders = (
  items: UnprocessedItem[],
): string[] => [...new Set(items.flatMap((item) => Object.keys(item)))];

/** Collapses transactions to one entry per merchant, keeping the last one seen. */
export const countTransactionsByMerchant = (
  transactions: TransactionFields[],
): (TransactionFields & { count: number })[] => {
  const items: Record<string, TransactionFields & { count: number }> = {};

  for (const transaction of transactions) {
    const count = items[transaction.merchant]?.count || 0;

    items[transaction.merchant] = {
      ...transaction,
      count: count + 1,
    };
  }

  return Object.values(items);
};
