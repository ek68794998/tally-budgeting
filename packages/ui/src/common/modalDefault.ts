import { type Asset } from "@tally/data-models/contracts/asset";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import { DefaultSubcategoryId } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";

export const ModalDefaultAsset: Readonly<Asset> = {
	active: true,
	id: -1,
	name: "",
	provider: null,
	type: "fixed_asset",
	valueCents: 0,
} as const;

export const ModalDefaultTransaction: Readonly<Transaction> = {
	amountCents: 0,
	categoryId: DefaultCategoryId,
	date: new Date().toISOString(),
	id: -1,
	merchant: "",
	notes: "",
	subcategoryId: DefaultSubcategoryId,
	type: "debit",
} as const;

export const ModalDefaultTransactionRule: Readonly<TransactionRule> = {
	active: true,
	id: -1,
	matcher: {
		flags: "i",
		pattern: "",
	},
	merchantName: "",
	priority: 0,
	subcategoryId: DefaultSubcategoryId,
} as const;
