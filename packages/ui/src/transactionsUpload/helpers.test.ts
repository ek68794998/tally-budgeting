import { buildTransaction } from "@tally/data-models/testing/fixtures";
import { describe, expect, it } from "vitest";
import {
	countTransactionsByMerchant,
	getUnprocessedItemHeaders,
	groupUploadResults,
} from "./helpers";

const ignoredRow = Object.fromEntries([
	["Amount", "1.00"],
	["Description", "PAYMENT"],
]);
const categorized = buildTransaction({ id: 1, subcategoryId: 4 });
const uncategorized = buildTransaction({ id: 2, subcategoryId: -1 });

describe("groupUploadResults", () => {
	it("splits processed rows by categorization and keeps ignored rows as records", () => {
		expect(
			groupUploadResults(
				{
					rowsFailed: [],
					rowsIgnored: [ignoredRow, "not a record"],
					rowsProcessed: [categorized, uncategorized],
					success: true,
				},
				"Error",
			),
		).toEqual({
			rowsFailed: [],
			rowsIgnored: [ignoredRow, {}],
			transactionsCategorized: [categorized],
			transactionsUncategorized: [uncategorized],
		});
	});

	it("puts each failed row's message in an error column before its CSV columns", () => {
		const { rowsFailed } = groupUploadResults(
			{
				rowsFailed: [
					["Missing amount", ignoredRow],
					["Unreadable row", null],
				],
				rowsIgnored: [],
				rowsProcessed: [],
				success: true,
			},
			"Error",
		);

		expect(rowsFailed).toEqual([
			{
				...Object.fromEntries([["Error", "Missing amount"]]),
				...ignoredRow,
			},
			Object.fromEntries([["Error", "Unreadable row"]]),
		]);
		expect(getUnprocessedItemHeaders(rowsFailed)).toEqual([
			"Error",
			"Amount",
			"Description",
		]);
	});
});

describe("getUnprocessedItemHeaders", () => {
	it("collects every column in first-seen order", () => {
		expect(
			getUnprocessedItemHeaders([
				ignoredRow,
				Object.fromEntries([
					["Description", "X"],
					["Memo", "Y"],
				]),
			]),
		).toEqual(["Amount", "Description", "Memo"]);
		expect(getUnprocessedItemHeaders([])).toEqual([]);
	});
});

describe("countTransactionsByMerchant", () => {
	it("collapses transactions per merchant, keeping the latest one", () => {
		const latest = buildTransaction({
			amountCents: 9,
			id: 3,
			merchant: "A",
		});

		expect(
			countTransactionsByMerchant([
				buildTransaction({ id: 1, merchant: "A" }),
				buildTransaction({ id: 2, merchant: "B" }),
				latest,
			]),
		).toEqual([
			{ ...latest, count: 2 },
			{ ...buildTransaction({ id: 2, merchant: "B" }), count: 1 },
		]);
	});
});
