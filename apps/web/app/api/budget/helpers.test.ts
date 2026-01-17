import { type GetBudgetQuery } from "@tally/data-models/contracts/api/getBudget";
import { describe, expect, it } from "vitest";
import { type BudgetSummaryDates, getBudgetSummaryDates } from "./helpers";

type BudgetSummaryDatesValues = Record<keyof BudgetSummaryDates, string>;

describe("Budget API helpers", () => {
	describe("getBudgetSummaryDates", () => {
		it.each<[GetBudgetQuery, BudgetSummaryDatesValues]>([
			[
				{ endMonth: "9", endYear: "2024", months: "1" },
				{
					durationMonths: "1",
					endDate: "2024-09-30T23:59:59.999Z",
					searchStartDate: "2023-10-01T00:00:00.000Z",
					transactionStartDate: "2024-09-01T00:00:00.000Z",
				},
			],
			[
				{ endMonth: "9", endYear: "2024", months: "6" },
				{
					durationMonths: "6",
					endDate: "2024-09-30T23:59:59.999Z",
					searchStartDate: "2023-10-01T00:00:00.000Z",
					transactionStartDate: "2024-04-01T00:00:00.000Z",
				},
			],
			[
				{ endMonth: "9", endYear: "2024", months: "12" },
				{
					durationMonths: "12",
					endDate: "2024-09-30T23:59:59.999Z",
					searchStartDate: "2023-10-01T00:00:00.000Z",
					transactionStartDate: "2023-10-01T00:00:00.000Z",
				},
			],
		])("should return the correct dates for %s", (params, {
			durationMonths: expectedMonths,
			endDate: expectedEnd,
			searchStartDate: expectedSearchStart,
			transactionStartDate: expectedTransactionsStart,
		}) => {
			const result = getBudgetSummaryDates(params);
			expect(result.durationMonths).toBe(Number(expectedMonths));
			expect(result.endDate.toISO()).toBe(expectedEnd);
			expect(result.searchStartDate.toISO()).toBe(expectedSearchStart);
			expect(result.transactionStartDate.toISO()).toBe(
				expectedTransactionsStart,
			);
		});
	});
});
