import { type Asset } from "../contracts/asset";
import { type Category } from "../contracts/category";
import { type NetWorthSnapshot } from "../contracts/netWorthSnapshot";
import { type Subcategory } from "../contracts/subcategory";
import { type Transaction } from "../contracts/transaction";
import { type TransactionRule } from "../contracts/transactionRule";

export const buildAsset = (overrides: Partial<Asset> = {}): Asset => ({
	active: true,
	id: 1,
	name: "Checking",
	provider: null,
	type: "liquid_asset",
	valueCents: 100_00,
	...overrides,
});

export const buildCategory = (overrides: Partial<Category> = {}): Category => ({
	id: 1,
	label: "Housing",
	...overrides,
});

export const buildSubcategory = (
	overrides: Partial<Subcategory> = {},
): Subcategory => ({
	budget: {
		amountCents: 1200_00,
		frequency: 12,
		type: "expense",
	},
	categoryId: 1,
	description: "",
	id: 1,
	label: "Rent",
	percentNeeds: 100,
	percentSavings: 0,
	...overrides,
});

export const buildTransaction = (
	overrides: Partial<Transaction> = {},
): Transaction => ({
	amountCents: 25_00,
	categoryId: 1,
	date: "2025-01-15T12:00:00.000Z",
	happiness: 2,
	id: 1,
	merchant: "Coffee Shop",
	notes: "",
	subcategoryId: 1,
	type: "debit",
	...overrides,
});

export const buildTransactionRule = (
	overrides: Partial<TransactionRule> = {},
): TransactionRule => ({
	active: true,
	id: 1,
	matcher: {
		flags: "i",
		pattern: "coffee",
	},
	merchantName: "Coffee Shop",
	priority: 0,
	subcategoryId: 1,
	...overrides,
});

export const buildNetWorthSnapshot = (
	overrides: Partial<NetWorthSnapshot> = {},
): NetWorthSnapshot => ({
	date: "2025-01-01T00:00:00.000Z",
	id: 1,
	valueCents: 1000_00,
	...overrides,
});
