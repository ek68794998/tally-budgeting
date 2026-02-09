import { BadRequest, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import {
	type GetBudgetSummaryResponse,
	getBudgetQuerySchema,
} from "@tally/data-models/contracts/api/getBudgetSummary";
import { DateTime } from "luxon";
import z from "zod";
import { SubcategoriesClient } from "../../../storage/subcategoriesClient";
import { TxnsClient } from "../../../storage/txnsClient";
import { telemetry } from "../../../telemetry/telemetry";
import { createApiHandler } from "../../handlers/createApiHandler";
import { HttpError } from "../../handlers/httpError";
import { type ApiResult } from "../../handlers/types";
import { type NextResponseFn } from "../../types";
import { createBudgetSummaryData } from "./helpers";

const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());
const txnsClientLazy = new Lazy(() => new TxnsClient());

export const GetBudgetRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:BUDGET",
	handler: async ({
		query: searchParams,
	}): Promise<ApiResult<GetBudgetSummaryResponse>> => {
		const subcategoriesClient = subcategoriesClientLazy.get();
		const txnsClient = txnsClientLazy.get();

		const endMonth = Number(searchParams.endMonth);
		const endYear = Number(searchParams.endYear);

		const endDateMonth = DateTime.fromObject(
			{ month: endMonth, year: endYear },
			{ zone: "UTC" },
		);

		if (!endDateMonth.isValid) {
			throw new HttpError(
				"Invalid end date.",
				BadRequest,
				"invalidQueryParameters",
			);
		}

		const endDate = endDateMonth.endOf("month");
		const searchStartDate = endDate.startOf("month").minus({ months: 23 });

		const { end: endProfiling } = telemetry().profile(
			"GET_BUDGET_SUMMARY_DATA",
		);

		const subcategories = await subcategoriesClient.getSubcategoriesAsync();
		const transactions = await txnsClient.getTransactionsInPeriodAsync(
			searchStartDate,
			endDate,
		);

		endProfiling();

		const summaryData = createBudgetSummaryData({
			endDate,
			subcategories,
			transactions,
		});

		return {
			data: summaryData,
			statusCode: Ok,
		};
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: getBudgetQuerySchema,
	},
});
