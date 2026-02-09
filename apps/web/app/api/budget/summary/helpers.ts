import {
	type AboveAverageItem,
	type ActionItems,
	type BudgetBreakdownItem,
	type BudgetChangeItem,
	type OverBudgetItem,
	type QuickPulseData,
} from "@tally/data-models/contracts/api/getBudgetSummary";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { Dollars } from "@tally/utilities/financial/dollars";
import {
	getTransactionEarnedValue,
	getTransactionSpentValue,
} from "@tally/utilities/financial/transactions";
import { DateTime } from "luxon";

export interface BudgetSummaryDates {
	durationMonths: number;
	endDate: DateTime;
	searchStartDate: DateTime;
	transactionStartDate: DateTime;
}

interface DateWindow {
	end: DateTime;
	start: DateTime;
}

interface BudgetSummaryInput {
	endDate: DateTime;
	subcategories: Subcategory[];
	transactions: Transaction[];
}

interface TransactionTotals {
	expenses: Map<number, number>;
	income: Map<number, number>;
}

const getCurrentMonthWindow = (endDate: DateTime): DateWindow => {
	const monthStart = endDate.startOf("month");
	const monthEnd = endDate.endOf("month");
	return { end: monthEnd, start: monthStart };
};

const getCurrent12MonthWindow = (endDate: DateTime): DateWindow => {
	const start = endDate.startOf("month").minus({ months: 11 });
	const end = endDate.endOf("month");
	return { end, start };
};

const getBudgetPeriodWindow = (
	endDate: DateTime,
	frequency: number,
): DateWindow => {
	const end = endDate.endOf("month");
	const start = endDate.startOf("month").minus({ months: frequency - 1 });
	return { end, start };
};

const getPreviousBudgetPeriodWindow = (
	endDate: DateTime,
	frequency: number,
): DateWindow => {
	const currentPeriod = getBudgetPeriodWindow(endDate, frequency);
	const start = currentPeriod.start.minus({ months: frequency });
	const end = currentPeriod.end.minus({ months: frequency });
	return { end, start };
};

const isTransactionInWindow = (
	transaction: Transaction,
	window: DateWindow,
): boolean => {
	const txnDate = DateTime.fromISO(transaction.date);
	return txnDate >= window.start && txnDate <= window.end;
};

const sumTotalMap = (totals: Map<number, number>) =>
	Array.from(totals.values()).reduce((sum, val) => sum + val, 0);

const countTransactionTotals = (
	transactions: Transaction[],
	subcategoryMap: Map<number, Subcategory>,
	window: DateWindow,
): TransactionTotals => {
	const totals: TransactionTotals = {
		expenses: new Map<number, number>(),
		income: new Map<number, number>(),
	};

	for (const transaction of transactions) {
		if (!isTransactionInWindow(transaction, window)) {
			continue;
		}

		const subcategory = subcategoryMap.get(transaction.subcategoryId);

		if (!subcategory) {
			continue;
		}

		let map: Map<number, number>;
		let value: number;

		if (subcategory.budget.type === "income") {
			map = totals.income;
			value = getTransactionEarnedValue(transaction, subcategory);
		} else if (subcategory.budget.type === "expense") {
			map = totals.expenses;
			value = getTransactionSpentValue(transaction, subcategory);
		} else {
			continue;
		}

		const existingValue = map.get(transaction.subcategoryId) || 0;
		map.set(transaction.subcategoryId, existingValue + value);
	}

	return totals;
};

interface BudgetSummaryData {
	actionItems: ActionItems;
	aiSummary: string | null;
	budgetBreakdown: BudgetBreakdownItem[];
	quickPulse: QuickPulseData;
}

export const createBudgetSummaryData = (
	input: BudgetSummaryInput,
): BudgetSummaryData => {
	const { endDate, subcategories, transactions } = input;

	const expenseSubcategories = subcategories.filter(
		(s) => s.budget.type === "expense",
	);

	const subcategoryMap = new Map<number, Subcategory>(
		subcategories.map((s) => [s.id, s]),
	);

	const currentMonthWindow = getCurrentMonthWindow(endDate);
	const current12MonthWindow = getCurrent12MonthWindow(endDate);

	const { expenses: currentMonthSpending, income: currentMonthIncome } =
		countTransactionTotals(
			transactions,
			subcategoryMap,
			currentMonthWindow,
		);
	const { expenses: current12MonthSpending, income: current12MonthIncome } =
		countTransactionTotals(
			transactions,
			subcategoryMap,
			current12MonthWindow,
		);

	let lastMonthBudgeted = 0;
	let last12MonthsBudgeted = 0;

	for (const subcategory of expenseSubcategories) {
		const budgetAmount = Dollars.fromCents(subcategory.budget.amountCents);
		const monthlyAmount = budgetAmount / subcategory.budget.frequency;

		lastMonthBudgeted += monthlyAmount;

		const occurrencesIn12Months = Math.ceil(
			12 / subcategory.budget.frequency,
		);
		last12MonthsBudgeted += budgetAmount * occurrencesIn12Months;
	}

	const lastMonthSpent = sumTotalMap(currentMonthSpending);
	const last12MonthsSpent = sumTotalMap(current12MonthSpending);
	const lastMonthIncome = sumTotalMap(currentMonthIncome);
	const last12MonthsIncome = sumTotalMap(current12MonthIncome);

	const overBudget: OverBudgetItem[] = [];
	const aboveAverage: AboveAverageItem[] = [];
	const improved: BudgetChangeItem[] = [];
	const worsened: BudgetChangeItem[] = [];
	const budgetBreakdown: BudgetBreakdownItem[] = [];

	for (const subcategory of expenseSubcategories) {
		const budgetPeriodWindow = getBudgetPeriodWindow(
			endDate,
			subcategory.budget.frequency,
		);
		const previousBudgetPeriodWindow = getPreviousBudgetPeriodWindow(
			endDate,
			subcategory.budget.frequency,
		);

		const { expenses: currentPeriodSpending } = countTransactionTotals(
			transactions,
			subcategoryMap,
			budgetPeriodWindow,
		);
		const { expenses: previousPeriodSpending } = countTransactionTotals(
			transactions,
			subcategoryMap,
			previousBudgetPeriodWindow,
		);

		const currentSpent = currentPeriodSpending.get(subcategory.id) || 0;
		const previousSpent = previousPeriodSpending.get(subcategory.id) || 0;
		const budgetAmount = Dollars.fromCents(subcategory.budget.amountCents);

		budgetBreakdown.push({
			budgetAmountCents: subcategory.budget.amountCents,
			budgetFrequency: subcategory.budget.frequency,
			budgetType: subcategory.budget.type,
			currentPeriodSpent: currentSpent,
			previousPeriodSpent: previousSpent,
			subcategoryId: subcategory.id,
		});

		if (budgetAmount <= 0) {
			continue;
		}

		if (currentSpent > budgetAmount) {
			overBudget.push({
				budgeted: budgetAmount,
				frequency: subcategory.budget.frequency,
				spent: currentSpent,
				subcategoryId: subcategory.id,
				type: "overBudget",
			});
		} else if (subcategory.budget.frequency > 1) {
			const monthlyAverage = Math.ceil(
				budgetAmount / subcategory.budget.frequency,
			);
			const spentInMonth = currentMonthSpending.get(subcategory.id) || 0;

			// Since this is an average and isn't precise, we add
			// $1 here to prevent a "5-cent over" from showing up.
			if (spentInMonth > monthlyAverage + 1) {
				const spentInPeriod = currentSpent;
				const remaining = budgetAmount - spentInPeriod;

				aboveAverage.push({
					budgetTotal: budgetAmount,
					monthlyAverage,
					remaining,
					spentThisMonth: spentInMonth,
					spentThisPeriod: spentInPeriod,
					subcategoryId: subcategory.id,
					type: "aboveAverage",
				});
			}
		}

		const wasInBudget = previousSpent <= budgetAmount;
		const isInBudget = currentSpent <= budgetAmount;

		const actionItem: BudgetChangeItem = {
			budgeted: budgetAmount,
			currentSpent,
			periodMonths: subcategory.budget.frequency,
			previousSpent,
			subcategoryId: subcategory.id,
			type: "budgetChange",
		};

		if (!wasInBudget && isInBudget) {
			improved.push(actionItem);
		} else if (wasInBudget && !isInBudget) {
			worsened.push(actionItem);
		}
	}

	return {
		actionItems: {
			aboveAverage,
			improved,
			overBudget,
			worsened,
		},
		aiSummary: null,
		budgetBreakdown,
		quickPulse: {
			last12Months: {
				budgeted: last12MonthsBudgeted,
				income: last12MonthsIncome, // TODO Add tests
				spent: last12MonthsSpent,
			},
			lastMonth: {
				budgeted: lastMonthBudgeted,
				income: lastMonthIncome, // TODO Add tests
				spent: lastMonthSpent,
			},
		},
	};
};
