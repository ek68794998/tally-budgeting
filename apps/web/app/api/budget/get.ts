import { Ok } from "@ekumlin/typescript-toolkit/http";
import { isNumber } from "@ekumlin/typescript-toolkit/types";
import {
	type GetBudgetResponse,
	getBudgetQuerySchema,
} from "@tally/data-models/contracts/api/getBudget";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { Dollars } from "@tally/utilities/financial/dollars";
import { Lazy } from "@tally/utilities/lazy/lazy";
import {
	getTransactionEarnedValue,
	getTransactionSpentValue,
} from "@tally/utilities/summary/helpers";
import { DateTime } from "luxon";
import z from "zod";
import { SubcategoriesClient } from "../../storage/subcategoriesClient";
import { TxnsClient } from "../../storage/txnsClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type ApiResult } from "../handlers/types";
import { type NextResponseFn } from "../types";
import { getBudgetSummaryDates } from "./helpers";

const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());
const txnsClientLazy = new Lazy(() => new TxnsClient());

export const GetBudgetRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:BUDGET",
	handler: async ({
		query: searchParams,
	}): Promise<ApiResult<GetBudgetResponse>> => {
		const subcategoriesClient = subcategoriesClientLazy.get();
		const txnsClient = txnsClientLazy.get();

		const {
			durationMonths,
			endDate,
			searchStartDate,
			transactionStartDate,
		} = getBudgetSummaryDates(searchParams);

		const endDateMonth = endDate.startOf("month");

		const spentWithinPeriodBySubcategory: Record<number, number> = {};

		let totalIncome = 0;
		let totalSpending = 0;
		let periodIncome = 0;
		let periodBudgeted = 0;
		let periodSpending = 0;

		const subcategories = await subcategoriesClient.getSubcategoriesAsync();
		const subcategoriesById: Record<string, Subcategory> = {};

		for (const subcategory of subcategories) {
			subcategoriesById[subcategory.id] = subcategory;
			spentWithinPeriodBySubcategory[subcategory.id] = 0;

			if (
				subcategory.budget.type !== "expense" ||
				subcategory.budget.frequency > durationMonths
			) {
				continue;
			}

			periodBudgeted +=
				Dollars.fromCents(subcategory.budget.amountCents) *
				Math.ceil(durationMonths / subcategory.budget.frequency);
		}

		const transactions = await txnsClient.getTransactionsInPeriodAsync(
			searchStartDate,
			endDate,
		);

		for (const transaction of transactions) {
			const { date, subcategoryId } = transaction;

			const transactionDate = DateTime.fromISO(date);
			const transactionSubcategory = subcategoriesById[subcategoryId];
			const transactionBudget = transactionSubcategory?.budget;

			if (!transactionBudget || transactionBudget.type === "neutral") {
				continue;
			}

			const amountSpent = getTransactionSpentValue(
				transaction,
				transactionSubcategory,
			);
			const amountEarned = getTransactionEarnedValue(
				transaction,
				transactionSubcategory,
			);

			totalIncome += amountEarned;
			totalSpending += amountSpent;

			if (transactionDate >= transactionStartDate) {
				periodIncome += amountEarned;
				periodSpending += amountSpent;
			}

			const budgetStartDate = endDateMonth.minus({
				months: transactionBudget.frequency - 1,
			});

			if (
				transactionDate >= budgetStartDate &&
				isNumber(spentWithinPeriodBySubcategory[subcategoryId])
			) {
				spentWithinPeriodBySubcategory[subcategoryId] += amountSpent;
			}
		}

		return {
			data: {
				bySubcategory: Object.entries(
					spentWithinPeriodBySubcategory,
				).map(([id, spent]) => ({
					spent,
					subcategoryId: Number(id),
				})),
				summary: {
					annualIncome: totalIncome,
					annualSpent: totalSpending,
					budgeted: periodBudgeted,
					income: periodIncome,
					spent: periodSpending,
				},
			},
			statusCode: Ok,
		};
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: getBudgetQuerySchema,
	},
});
