import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { describe, expect, it } from "vitest";
import {
	getTransactionEarnedValue,
	getTransactionSpentValue,
} from "../financial/transactions";

describe("transactions helpers", () => {
	const createTransaction = (
		type: "credit" | "debit",
		amountCents: number,
	): Transaction =>
		mockIncompleteObject<Transaction>({
			amountCents,
			type,
		});

	const createSubcategory = (budgetType: "income" | "expense"): Subcategory =>
		mockIncompleteObject<Subcategory>({
			budget: {
				amountCents: 1,
				frequency: 1,
				type: budgetType,
			},
		});

	describe("getTransactionEarnedValue", () => {
		it("returns positive value for credit transaction in income subcategory", () => {
			const transaction = createTransaction("credit", 10000);
			const subcategory = createSubcategory("income");

			expect(getTransactionEarnedValue(transaction, subcategory)).toBe(
				100,
			);
		});

		it("returns negative value for debit transaction in income subcategory", () => {
			const transaction = createTransaction("debit", 10000);
			const subcategory = createSubcategory("income");

			expect(getTransactionEarnedValue(transaction, subcategory)).toBe(
				-100,
			);
		});

		it("returns 0 for credit transaction in expense subcategory", () => {
			const transaction = createTransaction("credit", 10000);
			const subcategory = createSubcategory("expense");

			expect(getTransactionEarnedValue(transaction, subcategory)).toBe(0);
		});

		it("returns 0 for debit transaction in expense subcategory", () => {
			const transaction = createTransaction("debit", 10000);
			const subcategory = createSubcategory("expense");

			expect(getTransactionEarnedValue(transaction, subcategory)).toBe(0);
		});
	});

	describe("getTransactionSpentValue", () => {
		it("returns positive value for debit transaction in expense subcategory", () => {
			const transaction = createTransaction("debit", 10000);
			const subcategory = createSubcategory("expense");

			expect(getTransactionSpentValue(transaction, subcategory)).toBe(
				100,
			);
		});

		it("returns negative value for credit transaction in expense subcategory", () => {
			const transaction = createTransaction("credit", 10000);
			const subcategory = createSubcategory("expense");

			expect(getTransactionSpentValue(transaction, subcategory)).toBe(
				-100,
			);
		});

		it("returns 0 for debit transaction in income subcategory", () => {
			const transaction = createTransaction("debit", 10000);
			const subcategory = createSubcategory("income");

			expect(getTransactionSpentValue(transaction, subcategory)).toBe(0);
		});

		it("returns 0 for credit transaction in income subcategory", () => {
			const transaction = createTransaction("credit", 10000);
			const subcategory = createSubcategory("income");

			expect(getTransactionSpentValue(transaction, subcategory)).toBe(0);
		});
	});
});
