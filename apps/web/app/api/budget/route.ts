import {
	BadRequest,
	CacheControl,
	InternalServerError,
	Ok,
} from "@ekumlin/typescript-toolkit/http";
import { isNumber } from "@ekumlin/typescript-toolkit/types";
import {
	type GetBudgetResponse,
	getBudgetParamsSchema,
} from "@tally/data-models/contracts/api/getBudget";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { searchParamsToObject } from "@tally/utilities/object/searchParamsToObject";
import {
	getTransactionEarnedValue,
	getTransactionSpentValue,
} from "@tally/utilities/summary/helpers";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { SubcategoriesClient } from "../../storage/subcategoriesClient";
import { TransactionsClient } from "../../storage/transactionsClient";
import { type NextResponseFn } from "../types";
import { getBudgetSummaryDates } from "./helpers";

const subcategoriesClient = new SubcategoriesClient();
const transactionsClient = new TransactionsClient();

const GetAsync: NextResponseFn = async (request) => {
	try {
		const { searchParams } = new URL(request.url);

		const searchParamsObject = searchParamsToObject(searchParams);
		const parsedParams =
			getBudgetParamsSchema.safeParse(searchParamsObject);

		if (!parsedParams.success) {
			return NextResponse.json(
				{
					error: "Invalid query parameters",
					success: false,
				},
				{
					status: BadRequest,
				},
			);
		}

		const {
			durationMonths,
			endDate,
			searchStartDate,
			transactionStartDate,
		} = getBudgetSummaryDates(parsedParams.data);

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
				subcategory.budget.amount *
				Math.ceil(durationMonths / subcategory.budget.frequency);
		}

		const transactions =
			await transactionsClient.getTransactionsInPeriodAsync(
				searchStartDate.toISO(),
				endDate.toISO(),
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

		const response: GetBudgetResponse = {
			bySubcategory: Object.entries(spentWithinPeriodBySubcategory).map(
				([id, spent]) => ({
					spent,
					subcategoryId: Number(id),
				}),
			),
			summary: {
				annualIncome: totalIncome,
				annualSpent: totalSpending,
				budgeted: periodBudgeted,
				income: periodIncome,
				spent: periodSpending,
			},
		};

		return NextResponse.json(response, {
			headers: {
				[CacheControl]: "no-cache, no-store, must-revalidate",
			},
			status: Ok,
		});
	} catch (error) {
		console.error("Failed to fetch transactions:", error);

		return NextResponse.json(
			{
				error: "Failed to fetch transactions",
				success: false,
			},
			{
				status: InternalServerError,
			},
		);
	}
};

export { GetAsync as GET };
