import { Created } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { postTransactionRuleRequestSchema } from "@tally/data-models/contracts/api/postTransactionRule";
import z from "zod";
import { TxnRulesClient } from "../../../storage/txnRulesClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";

const txnRulesClientLazy = new Lazy(() => new TxnRulesClient());

export const PostTransactionsRulesRouteAsync: NextResponseFn = createApiHandler(
	{
		eventName: "POST:TRANSACTIONS/RULES",
		handler: async ({ body }) => {
			await txnRulesClientLazy
				.get()
				.insertTransactionRulesAsync([body.rule]);

			return { statusCode: Created };
		},
		schemata: {
			body: postTransactionRuleRequestSchema,
			params: z.unknown(),
			query: z.unknown(),
		},
	},
);
