import { BadRequest, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import {
	type GetBudgetSpendingResponse,
	getBudgetSpendingQuerySchema,
} from "@tally/data-models/contracts/api/getBudgetSpending";
import { getTransactionSpentValue } from "@tally/utilities/financial/transactions";
import { DateTime } from "luxon";
import z from "zod";
import { SubcategoriesClient } from "../../../storage/subcategoriesClient";
import { TxnsClient } from "../../../storage/txnsClient";
import { telemetry } from "../../../telemetry/telemetry";
import { createApiHandler } from "../../handlers/createApiHandler";
import { HttpError } from "../../handlers/httpError";
import { type ApiResult } from "../../handlers/types";
import { type NextResponseFn } from "../../types";

const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());
const txnsClientLazy = new Lazy(() => new TxnsClient());

export const GetBudgetSpendingRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:BUDGET/SPENDING",
	handler: async ({
		query: searchParams,
	}): Promise<ApiResult<GetBudgetSpendingResponse>> => {
		const subcategoriesClient = subcategoriesClientLazy.get();
		const txnsClient = txnsClientLazy.get();

		const endDate = DateTime.fromISO(searchParams.endDate);
		const startDate = DateTime.fromISO(searchParams.startDate);

		if (!endDate.isValid || !startDate.isValid) {
			throw new HttpError(
				"Invalid date.",
				BadRequest,
				"invalidQueryParameters",
			);
		}

		const { end: endProfiling } = telemetry().profile(
			"GET_BUDGET_SPENDING_DATA",
		);

		const subcategories = await subcategoriesClient.getSubcategoriesAsync();
		const transactions = await txnsClient.getTransactionsInPeriodAsync(
			startDate.startOf("day"),
			endDate.endOf("day"),
		);

		endProfiling();

		const response: GetBudgetSpendingResponse = {
			data: [],
			success: true,
		};

		const spendingBySubcategory: Record<number, number> = {};

		for (const transaction of transactions) {
			const subcategory = subcategories.find(
				(s) => s.id === transaction.subcategoryId,
			);
			const value = subcategory
				? getTransactionSpentValue(transaction, subcategory)
				: 0;

			if (value <= 0) {
				continue;
			}

			spendingBySubcategory[transaction.subcategoryId] =
				(spendingBySubcategory[transaction.subcategoryId] ?? 0) +
				transaction.amountCents;
		}

		for (const [subcategoryId, spentCents] of Object.entries(
			spendingBySubcategory,
		)) {
			response.data.push({
				spentCents,
				subcategoryId: Number(subcategoryId),
			});
		}

		response.data.sort((a, b) => b.spentCents - a.spentCents);

		return {
			data: response,
			statusCode: Ok,
		};
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: getBudgetSpendingQuerySchema,
	},
});
