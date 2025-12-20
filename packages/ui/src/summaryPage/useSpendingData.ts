import { type Summary } from "@tally/utilities/summary/calculateSummary";
import { DateTime } from "luxon";
import { useMemo } from "react";
import z from "zod";

export type SpendingPeriod = "monthly" | "yearly";

export const spendingDataPointSchema = z.object({
	longName: z.string(),
	shortName: z.string(),
	valueEarned: z.number(),
	valueSpent: z.number(),
});

type SpendingDataPoint = z.infer<typeof spendingDataPointSchema>;

interface Props {
	spendingPeriod: SpendingPeriod;
	summary: Summary;
}

const getMonthLabels = (year: number, month: number) => {
	const dateTime = DateTime.fromObject({
		day: 15,
		month,
		year,
	});

	return {
		long: dateTime.toFormat("MMMM yyyy"),
		short: dateTime.toFormat("MMMM"),
	};
};

export const useSpendingData = ({
	spendingPeriod,
	summary,
}: Props): [SpendingDataPoint, SpendingDataPoint] => {
	const isMonthly = spendingPeriod === "monthly";

	return useMemo(() => {
		let currentIncome = 0;
		let previousIncome = 0;
		let currentSpend = 0;
		let previousSpend = 0;

		for (const [_, categorySummary] of Object.entries(summary.data)) {
			const {
				earnedCurrentMonth,
				earnedCurrentYear,
				earnedPreviousMonth,
				earnedPreviousYear,
				spentCurrentMonth,
				spentCurrentYear,
				spentPreviousMonth,
				spentPreviousYear,
			} = categorySummary;

			currentIncome += isMonthly ? earnedCurrentMonth : earnedCurrentYear;
			previousIncome += isMonthly
				? earnedPreviousMonth
				: earnedPreviousYear;
			currentSpend += isMonthly ? spentCurrentMonth : spentCurrentYear;
			previousSpend += isMonthly ? spentPreviousMonth : spentPreviousYear;
		}

		let currentLongName = `${summary.currentYear}`;
		let previousLongName = `${summary.previousYear}`;
		let currentShortName = `${summary.currentYear}`;
		let previousShortName = `${summary.previousYear}`;

		if (isMonthly) {
			const currentMonth = getMonthLabels(
				summary.currentMonth.year,
				summary.currentMonth.month,
			);
			const previousMonth = getMonthLabels(
				summary.previousMonth.year,
				summary.previousMonth.month,
			);

			currentShortName = currentMonth.short;
			previousShortName = previousMonth.short;
			currentLongName = currentMonth.long;
			previousLongName = previousMonth.long;
		}

		return [
			{
				longName: previousLongName,
				shortName: previousShortName,
				valueEarned: previousIncome,
				valueSpent: previousSpend,
			},
			{
				longName: currentLongName,
				shortName: currentShortName,
				valueEarned: currentIncome,
				valueSpent: currentSpend,
			},
		];
	}, [isMonthly, summary]);
};
