import {
	DefaultSubcategory,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { createBudgetSummaryData } from "./helpers";

describe("Budget API helpers", () => {
	describe("createBudgetSummaryData", () => {
		const createValidDateTime = (isoString: string): DateTime => {
			const dt = DateTime.fromISO(isoString, { zone: "utc" });

			if (!dt.isValid) {
				throw new Error(`Invalid DateTime: ${isoString}`);
			}

			return dt;
		};

		const createTestSubcategory = (
			id: number,
			label: string,
			amountCents: number,
			frequency: number,
			type: "expense" | "income" | "neutral" = "expense",
		): Subcategory => ({
			...DefaultSubcategory,
			budget: {
				amountCents,
				frequency,
				type,
			},
			categoryId: 1,
			description: "",
			id,
			label,
		});

		const createTestTransaction = (
			id: number,
			subcategoryId: number,
			date: string,
			amountCents: number,
			type: "debit" | "credit" = "debit",
		): Transaction => ({
			amountCents,
			categoryId: 1,
			date,
			happiness: 2,
			id,
			merchant: "Test Merchant",
			notes: "",
			subcategoryId,
			type,
		});

		it("should calculate quick pulse for single monthly budget", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 45000),
				createTestTransaction(2, 1, "2025-01-15", 48000),
				createTestTransaction(3, 1, "2024-06-10", 50000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.lastMonth.budgeted).toBe(500);
			expect(result.quickPulse.lastMonth.spent).toBe(450);
			expect(result.quickPulse.last12Months.budgeted).toBe(6000);
			expect(result.quickPulse.last12Months.spent).toBe(1430);
		});

		it("should calculate quick pulse for quarterly budget", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Insurance", 150000, 3),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 150000),
				createTestTransaction(2, 1, "2024-11-05", 150000),
				createTestTransaction(3, 1, "2024-08-05", 150000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.lastMonth.budgeted).toBe(500);
			expect(result.quickPulse.lastMonth.spent).toBe(1500);
			expect(result.quickPulse.last12Months.budgeted).toBe(6000);
			expect(result.quickPulse.last12Months.spent).toBe(4500);
		});

		it("should calculate quick pulse for annual budget", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Property Tax", 360000, 12),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-01-15", 360000),
				createTestTransaction(2, 1, "2024-01-15", 360000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.lastMonth.budgeted).toBe(300);
			expect(result.quickPulse.lastMonth.spent).toBe(0);
			expect(result.quickPulse.last12Months.budgeted).toBe(3600);
			expect(result.quickPulse.last12Months.spent).toBe(3600);
		});

		it("should detect over-budget spending", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Dining Out", 50000, 1),
				createTestSubcategory(2, "Entertainment", 15000, 1),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 54700),
				createTestTransaction(2, 2, "2025-02-08", 16300),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.actionItems.overBudget).toHaveLength(2);
			expect(result.actionItems.overBudget[0]).toEqual({
				budgeted: 500,
				frequency: 1,
				spent: 547,
				subcategoryId: 1,
				type: "overBudget",
			});
			expect(result.actionItems.overBudget[1]).toEqual({
				budgeted: 150,
				frequency: 1,
				spent: 163,
				subcategoryId: 2,
				type: "overBudget",
			});
		});

		it("should detect above-average spending in multi-month budget", () => {
			const endDate = createValidDateTime("2025-01-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Gifts", 120000, 12),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-01-15", 80000),
				createTestTransaction(2, 1, "2024-12-20", 30000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.actionItems.aboveAverage).toHaveLength(1);
			expect(result.actionItems.aboveAverage[0]).toEqual({
				budgetTotal: 1200,
				monthlyAverage: 100,
				remaining: 100,
				spentThisMonth: 800,
				spentThisPeriod: 1100,
				subcategoryId: 1,
				type: "aboveAverage",
			});
		});

		it("should detect improved budgets", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-10", 43500),
				createTestTransaction(2, 1, "2025-01-15", 54000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.actionItems.improved).toHaveLength(1);
			expect(result.actionItems.improved[0]).toEqual({
				budgeted: 500,
				currentSpent: 435,
				periodMonths: 1,
				previousSpent: 540,
				subcategoryId: 1,
				type: "budgetChange",
			});
		});

		it("should detect worsened budgets", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Dining Out", 50000, 1),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-10", 58000),
				createTestTransaction(2, 1, "2025-01-15", 45000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.actionItems.worsened).toHaveLength(1);
			expect(result.actionItems.worsened[0]).toEqual({
				budgeted: 500,
				currentSpent: 580,
				periodMonths: 1,
				previousSpent: 450,
				subcategoryId: 1,
				type: "budgetChange",
			});
		});

		it("should handle mixed budget frequencies", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1),
				createTestSubcategory(2, "Insurance", 60000, 3),
				createTestSubcategory(3, "Property Tax", 120000, 12),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 48000),
				createTestTransaction(2, 2, "2025-01-10", 60000),
				createTestTransaction(3, 3, "2024-12-15", 120000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.lastMonth.budgeted).toBe(800);
			expect(result.quickPulse.last12Months.budgeted).toBe(9600);
			expect(result.budgetBreakdown).toHaveLength(3);
		});

		it("should exclude income and neutral budgets from expense tracking", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1, "expense"),
				createTestSubcategory(2, "Salary", 500000, 1, "income"),
				createTestSubcategory(3, "Transfer", 100000, 1, "neutral"),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 45000),
				createTestTransaction(2, 2, "2025-02-01", 500000, "credit"),
				createTestTransaction(3, 3, "2025-02-03", 100000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.lastMonth.budgeted).toBe(500);
			expect(result.quickPulse.lastMonth.spent).toBe(450);
			expect(result.budgetBreakdown).toHaveLength(1);
			expect(result.budgetBreakdown[0]?.subcategoryId).toBe(1);
		});

		it("should track income separately in quick pulse for last month", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1, "expense"),
				createTestSubcategory(2, "Salary", 500000, 1, "income"),
				createTestSubcategory(3, "Freelance", 200000, 1, "income"),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 45000, "debit"),
				createTestTransaction(2, 2, "2025-02-01", 500000, "credit"),
				createTestTransaction(3, 3, "2025-02-15", 180000, "credit"),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.lastMonth.income).toBe(6800);
			expect(result.quickPulse.lastMonth.spent).toBe(450);
		});

		it("should track income separately in quick pulse for last 12 months", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1, "expense"),
				createTestSubcategory(2, "Salary", 500000, 1, "income"),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 45000, "debit"),
				createTestTransaction(2, 1, "2025-01-15", 48000, "debit"),
				createTestTransaction(3, 1, "2024-06-10", 50000, "debit"),
				createTestTransaction(4, 2, "2025-02-01", 500000, "credit"),
				createTestTransaction(5, 2, "2025-01-01", 500000, "credit"),
				createTestTransaction(6, 2, "2024-12-01", 500000, "credit"),
				createTestTransaction(7, 2, "2024-11-01", 500000, "credit"),
				createTestTransaction(8, 2, "2024-02-01", 500000, "credit"),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.last12Months.income).toBe(20000);
			expect(result.quickPulse.last12Months.spent).toBe(1430);
		});

		it("should handle zero income when no income transactions exist", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1, "expense"),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 45000, "debit"),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.lastMonth.income).toBe(0);
			expect(result.quickPulse.last12Months.income).toBe(0);
		});

		it("should handle debit transactions on income subcategories as negative income", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Salary", 500000, 1, "income"),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-01", 500000, "credit"),
				createTestTransaction(2, 1, "2025-02-15", 50000, "debit"),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.lastMonth.income).toBe(4500);
		});

		it("should handle empty transactions", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1),
			];

			const transactions: Transaction[] = [];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.lastMonth.budgeted).toBe(500);
			expect(result.quickPulse.lastMonth.spent).toBe(0);
			expect(result.quickPulse.last12Months.budgeted).toBe(6000);
			expect(result.quickPulse.last12Months.spent).toBe(0);
			expect(result.actionItems.overBudget).toHaveLength(0);
			expect(result.actionItems.improved).toHaveLength(0);
			expect(result.actionItems.worsened).toHaveLength(0);
		});

		it("should handle empty subcategories", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [];
			const transactions: Transaction[] = [];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.quickPulse.lastMonth.budgeted).toBe(0);
			expect(result.quickPulse.lastMonth.spent).toBe(0);
			expect(result.quickPulse.last12Months.budgeted).toBe(0);
			expect(result.quickPulse.last12Months.spent).toBe(0);
			expect(result.budgetBreakdown).toHaveLength(0);
		});

		it("should return null for AI summary", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1),
			];

			const transactions: Transaction[] = [];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.aiSummary).toBeNull();
		});

		it("should populate budget breakdown with current and previous period spending", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 45000),
				createTestTransaction(2, 1, "2025-01-15", 48000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.budgetBreakdown).toHaveLength(1);
			expect(result.budgetBreakdown[0]).toEqual({
				budgetAmountCents: 50000,
				budgetFrequency: 1,
				budgetType: "expense",
				currentPeriodSpent: 450,
				previousPeriodSpent: 480,
				subcategoryId: 1,
			});
		});

		it("should skip action items for subcategories with zero budget", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Uncategorized", 0, 1),
				createTestSubcategory(2, "Groceries", 50000, 1),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 100000),
				createTestTransaction(2, 2, "2025-02-08", 45000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.actionItems.overBudget).toHaveLength(0);
			expect(result.actionItems.aboveAverage).toHaveLength(0);
			expect(result.actionItems.improved).toHaveLength(0);
			expect(result.actionItems.worsened).toHaveLength(0);

			expect(result.budgetBreakdown).toHaveLength(2);
			expect(result.budgetBreakdown[0]?.currentPeriodSpent).toBe(1000);
		});

		it("should skip action items for subcategories with negative budget", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Weird Category", -10000, 1),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 50000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.actionItems.overBudget).toHaveLength(0);
			expect(result.actionItems.aboveAverage).toHaveLength(0);
			expect(result.actionItems.improved).toHaveLength(0);
			expect(result.actionItems.worsened).toHaveLength(0);
		});

		it("should detect improved budgets for quarterly frequency", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Insurance", 60000, 3),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-01-15", 55000),
				createTestTransaction(2, 1, "2024-11-15", 65000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.actionItems.improved).toHaveLength(1);
			expect(result.actionItems.improved[0]).toEqual({
				budgeted: 600,
				currentSpent: 550,
				periodMonths: 3,
				previousSpent: 650,
				subcategoryId: 1,
				type: "budgetChange",
			});
		});

		it("should detect worsened budgets for annual frequency", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Property Tax", 120000, 12),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2024-12-15", 125000),
				createTestTransaction(2, 1, "2023-12-15", 115000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.actionItems.worsened).toHaveLength(1);
			expect(result.actionItems.worsened[0]).toEqual({
				budgeted: 1200,
				currentSpent: 1250,
				periodMonths: 12,
				previousSpent: 1150,
				subcategoryId: 1,
				type: "budgetChange",
			});
		});

		it("should not create action items when budget stayed within budget both periods", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Groceries", 50000, 1),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 45000),
				createTestTransaction(2, 1, "2025-01-15", 48000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.actionItems.improved).toHaveLength(0);
			expect(result.actionItems.worsened).toHaveLength(0);
		});

		it("should not create action items when budget stayed over budget both periods", () => {
			const endDate = createValidDateTime("2025-02-10T00:00:00.000Z");

			const subcategories: Subcategory[] = [
				createTestSubcategory(1, "Dining Out", 50000, 1),
			];

			const transactions: Transaction[] = [
				createTestTransaction(1, 1, "2025-02-05", 55000),
				createTestTransaction(2, 1, "2025-01-15", 58000),
			];

			const result = createBudgetSummaryData({
				endDate,
				subcategories,
				transactions,
			});

			expect(result.actionItems.improved).toHaveLength(0);
			expect(result.actionItems.worsened).toHaveLength(0);
		});
	});
});
