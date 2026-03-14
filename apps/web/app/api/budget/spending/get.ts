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
import { calculateBudgetSpending } from "./helpers";

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

		const {
			spending,
			spentOnNeedsCents,
			spentOnSavingsCents,
			spentOnWantsCents,
		} = calculateBudgetSpending({ subcategories, transactions });

		const responseData: GetBudgetSpendingResponse = {
			spending,
			spentOnNeedsCents,
			spentOnSavingsCents,
			spentOnWantsCents,
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
