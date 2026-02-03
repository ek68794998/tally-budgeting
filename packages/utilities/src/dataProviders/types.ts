import { type Asset } from "@tally/data-models/contracts/asset";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { type Merchant } from "../dataHandlers/types";

export interface TransactionCustomizations {
	accounts: Asset[];
	merchants: Merchant[];
	subcategories: Subcategory[];
}

export type CsvTransaction = Omit<Transaction, "id" | "happiness" | "notes">;

export type CsvRowToTransactionFn<TInputRow extends object> = (
	inputRow: TInputRow,
	account: string,
	customizations: TransactionCustomizations,
) => CsvTransaction;

export type ValidationErrorFn<T> = (
	obj: unknown,
	validationErrors: string[],
) => obj is T;

export interface DataProvider<TStatementRow extends object> {
	convertStatementRowToTransaction: CsvRowToTransactionFn<TStatementRow>;
	validateIsStatementRow: ValidationErrorFn<TStatementRow>;
}
