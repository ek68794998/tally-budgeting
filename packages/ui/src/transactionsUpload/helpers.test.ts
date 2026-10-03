import { buildTransaction } from "@tally/data-models/testing/fixtures";
import { describe, expect, it } from "vitest";
import {
	countTransactionsByMerchant,
	groupUploadResults,
	toUnprocessedItems,
} from "./helpers";

const ignoredRow = Object.fromEntries([
	["Amount", "1.00"],
	["Description", "PAYMENT"],
]);
const categorized = buildTransaction({ id: 1, subcategoryId: 4 });
const uncategorized = buildTransaction({ id: 2, subcategoryId: -1 });

describe("groupUploadResults", () => {
	it("splits processed rows by categorization and takes headers from ignored rows", () => {
		expect(
			groupUploadResults({
				rowsFailed: [],
				rowsIgnored: [ignoredRow],
				rowsProcessed: [categorized, uncategorized],
				success: true,
			}),
		).toEqual({
			inputCsvHeaders: ["Amount", "Description"],
			rowsFailed: [],
			rowsIgnored: [ignoredRow],
			transactionsCategorized: [categorized],
			transactionsUncategorized: [uncategorized],
		});
	});

	it("has no headers when every row was processed", () => {
		expect(
			groupUploadResults({
				rowsFailed: [],
				rowsIgnored: [],
				rowsProcessed: [],
				success: true,
			}).inputCsvHeaders,
		).toEqual([]);
	});

	// Known bug: failed rows are `[message, row]` tuples, so the headers become "0" and "1".
	it.fails("takes headers from the CSV row inside a failed result", () => {
		expect(
			groupUploadResults({
				rowsFailed: [["Missing amount", ignoredRow]],
				rowsIgnored: [],
				rowsProcessed: [],
				success: true,
			}).inputCsvHeaders,
		).toEqual(["Amount", "Description"]);
	});
});

describe("toUnprocessedItems", () => {
	it("keeps string records and blanks anything else", () => {
		expect(
			toUnprocessedItems([ignoredRow, ["Missing amount", ignoredRow]]),
		).toEqual([ignoredRow, {}]);
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
