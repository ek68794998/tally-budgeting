import { BadRequest, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import {
	type GetBudgetSpendingResponse,
	getBudgetSpendingQuerySchema,
} from "@tally/data-models/contracts/api/getBudgetSpending";
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

		const spending: GetBudgetSpendingResponse["spending"] = [];
		const spendingBySubcategory: Record<number, number> = {};
		let incomeCents = 0;
		let spentOnNeedsCents = 0;
		let spentOnSavingsCents = 0;
		let spentOnWantsCents = 0;

		for (const transaction of transactions) {
			const { amountCents, subcategoryId } = transaction;
			const subcategory = subcategories.find(
				(s) => s.id === subcategoryId,
			);

			if (!subcategory) {
				continue;
			}

			if (subcategory.budget.type === "income") {
				incomeCents += amountCents;
				continue;
			}

			if (subcategory.budget.type !== "expense") {
				continue;
			}

			const percentNeeds = subcategory.percentNeeds / 100.0;
			const percentSavings = subcategory.percentSavings / 100.0;
			const percentWants = 1.0 - percentSavings - percentNeeds;

			spentOnNeedsCents += percentNeeds * amountCents;
			spentOnSavingsCents += percentSavings * amountCents;
			spentOnWantsCents += percentWants * amountCents;

			spendingBySubcategory[subcategoryId] =
				(spendingBySubcategory[subcategoryId] ?? 0) + amountCents;
		}

		for (const [subcategoryId, spentCents] of Object.entries(
			spendingBySubcategory,
		)) {
			spending.push({
				spentCents,
				subcategoryId: Number(subcategoryId),
			});
		}

		spending.sort((a, b) => b.spentCents - a.spentCents);

		const notSpentCents =
			incomeCents -
			spentOnNeedsCents -
			spentOnSavingsCents -
			spentOnWantsCents;

		const responseData: GetBudgetSpendingResponse = {
			incomeCents,
			spending,
			spentOnNeedsCents: Math.round(spentOnNeedsCents),
			spentOnSavingsCents: Math.round(
				spentOnSavingsCents + notSpentCents,
			),
			spentOnWantsCents: Math.round(spentOnWantsCents),
			success: true,
		};

		return {
			data: responseData,
			statusCode: Ok,
		};
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: getBudgetSpendingQuerySchema,
	},
});
