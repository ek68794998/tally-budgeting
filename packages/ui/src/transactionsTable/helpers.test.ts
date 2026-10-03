import { type SharedSelection } from "@heroui/react";
import {
	buildAsset,
	buildSubcategory,
	buildTransaction,
} from "@tally/data-models/testing/fixtures";
import { describe, expect, it } from "vitest";
import {
	buildTransactionsFilter,
	getTransactionsTableData,
	isSelectionFilterActive,
	sortSubcategoriesForSelect,
} from "./helpers";

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

interface FilterCase {
	expected: string;
	input: Parameters<typeof buildTransactionsFilter>[0];
}

describe("buildTransactionsFilter", () => {
	it.each<FilterCase>([
		{
			expected: "",
			input: {
				accountIds: new Set(),
				searchValue: "  ",
				subcategoryIds: "all",
			},
		},
		{
			expected: "merchant like 'Joe''s'",
			input: {
				accountIds: "all",
				searchValue: " Joe's ",
				subcategoryIds: new Set(),
			},
		},
		{
			expected: "account in '1,2' and subcategory in '5'",
			input: {
				accountIds: new Set([1, 2]),
				searchValue: "",
				subcategoryIds: new Set([5]),
			},
		},
	])("builds `$expected`", ({ expected, input }) => {
		expect(buildTransactionsFilter(input)).toBe(expected);
	});
});

describe("isSelectionFilterActive", () => {
	it.each<[SharedSelection, boolean]>([
		["all", false],
		[new Set(), false],
		[new Set(["1"]), true],
	])("treats %o as active: %s", (selection, expected) => {
		expect(isSelectionFilterActive(selection)).toBe(expected);
	});
});

describe("sortSubcategoriesForSelect", () => {
	it("sorts by label with the default subcategory first, without mutating the input", () => {
		const subcategories = [
			buildSubcategory({ id: 2, label: "Rent" }),
			buildSubcategory({ id: -1, label: "Uncategorized" }),
			buildSubcategory({ id: 3, label: "Coffee" }),
		];

		expect(
			sortSubcategoriesForSelect(subcategories).map(({ id }) => id),
		).toEqual([-1, 3, 2]);
		expect(subcategories.map(({ id }) => id)).toEqual([2, -1, 3]);
	});
});
