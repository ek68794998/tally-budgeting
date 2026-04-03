import { describe, expect, it } from "vitest";
import { type SubcategoryRow } from "../database/subcategoryRow";
import { type TxnRow } from "../database/txnRow";
import {
	convertTransactionToTxnRow,
	convertTxnRowToTransaction,
} from "./transaction";

describe("transaction converters", () => {
	describe("convertTransactionToTxnRow", () => {
		it("converts a transaction to a TxnRow", () => {
			const result = convertTransactionToTxnRow({
				accountId: 5,
				amountCents: 1234,
				categoryId: 10,
				date: "2024-03-15T10:00:00.000Z",
				happiness: 2,
				id: 42,
				merchant: "Starbucks",
				notes: "morning coffee",
				subcategoryId: 3,
				type: "debit",
			});

			expect(result.account).toBe(5);
			expect(result.amount_cents).toBe("1234");
			expect(result.direction).toBe("debit");
			expect(result.happiness).toBe(2);
			expect(result.id).toBe(42);
			expect(result.merchant).toBe("Starbucks");
			expect(result.notes).toBe("morning coffee");
			expect(result.subcategory).toBe(3);
		});

		it("sets date to UTC noon", () => {
			const result = convertTransactionToTxnRow({
				accountId: 1,
				amountCents: 100,
				categoryId: 1,
				date: "2024-06-20T22:30:00.000Z",
				happiness: 2,
				id: 1,
				merchant: "Test",
				notes: "",
				subcategoryId: 1,
				type: "debit",
			});

			expect(result.date.getUTCHours()).toBe(12);
			expect(result.date.getUTCMinutes()).toBe(0);
			expect(result.date.getUTCSeconds()).toBe(0);
			expect(result.date.getUTCMilliseconds()).toBe(0);
		});

		it("maps undefined accountId to null", () => {
			const result = convertTransactionToTxnRow({
				amountCents: 500,
				categoryId: 1,
				date: "2024-01-01T00:00:00.000Z",
				happiness: 1,
				id: 1,
				merchant: "Shop",
				notes: "",
				subcategoryId: 2,
				type: "credit",
			});

			expect(result.account).toBeNull();
		});

		it("maps empty notes string to null", () => {
			const result = convertTransactionToTxnRow({
				accountId: 1,
				amountCents: 500,
				categoryId: 1,
				date: "2024-01-01T00:00:00.000Z",
				happiness: 1,
				id: 1,
				merchant: "Shop",
				notes: "",
				subcategoryId: 2,
				type: "credit",
			});

			expect(result.notes).toBeNull();
		});

		it("stringifies amountCents", () => {
			const result = convertTransactionToTxnRow({
				accountId: 1,
				amountCents: 99999,
				categoryId: 1,
				date: "2024-01-01T00:00:00.000Z",
				happiness: 2,
				id: 1,
				merchant: "Test",
				notes: "",
				subcategoryId: 1,
				type: "debit",
			});

			expect(result.amount_cents).toBe("99999");
		});
	});

	describe("convertTxnRowToTransaction", () => {
		const subcategoryRow: SubcategoryRow = {
			/* eslint-disable @typescript-eslint/naming-convention */
			budget_amount_cents: "5000",
			budget_frequency_months: 1,
			budget_type: "expense",
			category: 10,
			description: "Coffee and cafes",
			id: 0,
			label: "Coffee",
			pct_needs: 0,
			pct_savings: 0,
			/* eslint-enable @typescript-eslint/naming-convention */
		};

		const txnRow: TxnRow = {
			account: 5,
			amount_cents: "1234", // eslint-disable-line @typescript-eslint/naming-convention
			date: new Date("2024-03-15T12:00:00.000Z"),
			direction: "debit",
			happiness: 2,
			id: 42,
			merchant: "Starbucks",
			notes: "morning coffee",
			subcategory: 3,
		};

		const baseRow = {
			...txnRow,
			...subcategoryRow,
		};

		it("converts a TxnRow to a Transaction", () => {
			const result = convertTxnRowToTransaction(baseRow);

			expect(result.accountId).toBe(5);
			expect(result.amountCents).toBe(1234);
			expect(result.categoryId).toBe(10);
			expect(result.date).toBe("2024-03-15T12:00:00.000Z");
			expect(result.happiness).toBe(2);
			expect(result.id).toBe(42);
			expect(result.merchant).toBe("Starbucks");
			expect(result.notes).toBe("morning coffee");
			expect(result.subcategoryId).toBe(3);
			expect(result.type).toBe("debit");
		});

		it("coerces amount_cents string to number", () => {
			const result = convertTxnRowToTransaction({
				...baseRow,
				amount_cents: "98765", // eslint-disable-line @typescript-eslint/naming-convention
			});

			expect(result.amountCents).toBe(98765);
		});

		it("maps null account to undefined accountId", () => {
			const result = convertTxnRowToTransaction({
				...baseRow,
				account: null,
			});

			expect(result.accountId).toBeUndefined();
		});

		it("maps null notes to empty string", () => {
			const result = convertTxnRowToTransaction({
				...baseRow,
				notes: null,
			});

			expect(result.notes).toBe("");
		});
	});
});
