import { Ok } from "@ekumlin/typescript-toolkit/http";
import {
	type GetTransactionsResponse,
	getTransactionsParamsSchema,
} from "@tally/data-models/contracts/api/getTransactions";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import z from "zod";
import { TxnsClient } from "../../storage/txnsClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type ApiResult } from "../handlers/types";
import { type NextResponseFn } from "../types";

const txnsClientLazy = new Lazy(() => new TxnsClient());

export const GetTransactionsRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:TRANSACTIONS",
	handler: async (
		{ query: queryParams },
		request,
	): Promise<ApiResult<GetTransactionsResponse>> => {
		const txnsClient = txnsClientLazy.get();

		const { data: transactions, totalCount } =
			await txnsClient.getTransactionsAsync({
				collectionParams: queryParams,
			});

		const nextLinkUrl = new URL(request.url);
		nextLinkUrl.searchParams.set("page", String(queryParams.page + 1));
		nextLinkUrl.searchParams.set("limit", String(queryParams.limit));
		const nextLink = nextLinkUrl.toString();

		return {
			data: {
				count: totalCount,
				nextLink,
				transactions,
			},
			statusCode: Ok,
		};
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: getTransactionsParamsSchema,
	},
});
