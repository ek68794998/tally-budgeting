import { invariant } from "@ekumlin/typescript-toolkit/values";
import { type GetBudgetParams } from "@tally/data-models/contracts/api/getBudget";
import { DateTime } from "luxon";

export interface BudgetSummaryDates {
	durationMonths: number;
	endDate: DateTime<true>;
	searchStartDate: DateTime<true>;
	transactionStartDate: DateTime<true>;
}

export const getBudgetSummaryDates = (
	params: GetBudgetParams,
): BudgetSummaryDates => {
	const endMonth = Number(params.endMonth);
	const endYear = Number(params.endYear);
	const months = Number(params.months);

	invariant(
		!Number.isNaN(endMonth) &&
			!Number.isNaN(endYear) &&
			!Number.isNaN(months),
		"Parameters must not be NaN.",
	);

	const endDateMonth = DateTime.fromObject(
		{
			month: endMonth,
			year: endYear,
		},
		{ zone: "UTC" },
	);

	invariant(
		endDateMonth.isValid,
		"Month created from parameters must be valid.",
	);

	const searchStartDate = endDateMonth.minus({ months: 11 });
	const transactionStartDate = endDateMonth.minus({ months: months - 1 });
	const endDate = endDateMonth.endOf("month");

	return {
		durationMonths: months,
		endDate,
		searchStartDate,
		transactionStartDate,
	};
};
