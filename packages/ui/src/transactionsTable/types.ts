import { type TransactionDirection } from "@tally/data-models/contracts/transactionDirection";

export interface TransactionTableData {
	account: string | undefined;
	amount: string;
	date: string;
	id: number;
	merchant: string;
	notes: string | undefined;
	subcategory: string | undefined;
	type: TransactionDirection;
}
