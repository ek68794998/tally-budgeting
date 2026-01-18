import { Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { type GetTransactionRulesResponse } from "@tally/data-models/contracts/api/getTransactionRules";
import z from "zod";
import { TxnRulesClient } from "../../../storage/txnRulesClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type ApiResult } from "../../handlers/types";
import { type NextResponseFn } from "../../types";

const txnRulesClientLazy = new Lazy(() => new TxnRulesClient());

export const GetTransactionsRulesRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:TRANSACTIONS/RULES",
	handler: async (): Promise<ApiResult<GetTransactionRulesResponse>> => {
		const txnRulesClient = txnRulesClientLazy.get();
		const transactionRules =
			await txnRulesClient.getTransactionRulesAsync();

		return {
			data: { transactionRules },
			statusCode: Ok,
		};
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: z.unknown(),
	},
});
