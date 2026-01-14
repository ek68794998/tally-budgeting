import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { getTransactionEarnedValue, getTransactionSpentValue } from "./helpers";

interface SummaryMonth {
	month: number;
	year: number;
}

interface PeriodSummary {
	earnedCurrentMonth: number;
	earnedCurrentYear: number;
	earnedPreviousMonth: number;
	earnedPreviousYear: number;
	spentCurrentMonth: number;
	spentCurrentYear: number;
	spentPreviousMonth: number;
	spentPreviousYear: number;
}

export interface Summary {
	currentMonth: SummaryMonth;
	currentYear: number;
	data: Record<number, PeriodSummary>;
	previousMonth: SummaryMonth;
	previousYear: number;
}

interface TimingOptions {
	currentMonth: number;
	currentYear: number;
}

export const calculateSummary = (
	transactions: Transaction[],
	subcategories: Subcategory[],
	timing: TimingOptions,
): Summary => {
	const { currentMonth, currentYear } = timing;

	const previousYear = currentYear - 1;

	const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
	const previousMonthYear = currentMonth === 0 ? previousYear : currentYear;

	const summaries: Summary = {
		currentMonth: {
			month: currentMonth,
			year: currentYear,
		},
		currentYear,
		data: {},
		previousMonth: {
			month: previousMonth,
			year: previousMonthYear,
		},
		previousYear,
	};

	for (const subcategory of subcategories) {
		summaries.data[subcategory.id] = {
			earnedCurrentMonth: 0,
			earnedCurrentYear: 0,
			earnedPreviousMonth: 0,
			earnedPreviousYear: 0,
			spentCurrentMonth: 0,
			spentCurrentYear: 0,
			spentPreviousMonth: 0,
			spentPreviousYear: 0,
		};
	}

	for (const transaction of transactions) {
		const subcategory = subcategories.find(
			(s) => s.id === transaction.subcategoryId,
		);

		const summary = subcategory ? summaries.data[subcategory.id] : null;

		if (!summary || !subcategory) {
			continue;
		}

		const amountEarned = getTransactionEarnedValue(
			transaction,
			subcategory,
		);

		const amountSpent = getTransactionSpentValue(transaction, subcategory);

		if (!amountEarned && !amountSpent) {
			continue;
		}

		const date = new Date(transaction.date);

		if (date.getFullYear() === currentYear) {
			summary.earnedCurrentYear += amountEarned;
			summary.spentCurrentYear += amountSpent;

			if (date.getMonth() === currentMonth - 1) {
				summary.earnedCurrentMonth += amountEarned;
				summary.spentCurrentMonth += amountSpent;
			}
		}

		if (
			date.getFullYear() === previousMonthYear &&
			date.getMonth() === previousMonth - 1
		) {
			summary.earnedPreviousMonth += amountEarned;
			summary.spentPreviousMonth += amountSpent;
		}

		if (date.getFullYear() === previousYear) {
			summary.earnedPreviousYear += amountEarned;
			summary.spentPreviousYear += amountSpent;
		}
	}

	return summaries;
};
