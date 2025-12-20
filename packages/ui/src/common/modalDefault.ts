import { type Asset } from "@tally/data-models/contracts/asset";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";

export const ModalDefaultAsset: Readonly<Asset> = {
	active: true,
	id: -1,
	name: "",
	provider: null,
	type: "fixedAsset",
	value: 0,
} as const;

export const ModalDefaultTransaction: Readonly<Transaction> = {
	accountId: -1,
	amount: 0,
	categoryId: -1,
	date: new Date().toISOString(),
	id: -1,
	merchant: "",
	notes: "",
	subcategoryId: -1,
	type: "debit",
} as const;

export const ModalDefaultTransactionRule: Readonly<TransactionRule> = {
	id: -1,
	isActive: true,
	matcher: {
		flags: "i",
		pattern: "",
	},
	merchantName: "",
	priority: 0,
	subcategoryId: -1,
} as const;
