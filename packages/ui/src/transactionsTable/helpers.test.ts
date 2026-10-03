import {
	buildAsset,
	buildSubcategory,
	buildTransaction,
} from "@tally/data-models/testing/fixtures";
import { describe, expect, it } from "vitest";
import { getTransactionsTableData } from "./helpers";

describe("getTransactionsTableData", () => {
	const conversionData = {
		accounts: [buildAsset({ id: 3, name: "Checking" })],
		locale: "en-US",
		subcategories: [buildSubcategory({ id: 5, label: "Coffee" })],
	};

	it("formats each transaction for display", () => {
		const rows = getTransactionsTableData(
			[
				buildTransaction({
					accountId: 3,
					amountCents: 1234_56,
					date: "2025-01-15T12:00:00.000Z",
					id: 9,
					notes: "latte",
					subcategoryId: 5,
				}),
			],
			conversionData,
		);

		expect(rows).toEqual([
			{
				account: "Checking",
				amount: "$1,234.56",
				date: "January 15, 2025",
				id: 9,
				merchant: "Coffee Shop",
				notes: "latte",
				subcategory: "Coffee",
				type: "debit",
			},
		]);
	});

	it("leaves account and subcategory empty when they are not found", () => {
		const [row] = getTransactionsTableData(
			[buildTransaction({ accountId: undefined, subcategoryId: 99 })],
			conversionData,
		);

		expect(row).toMatchObject({
			account: undefined,
			subcategory: undefined,
		});
	});
});
