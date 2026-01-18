import { Ok } from "@ekumlin/typescript-toolkit/http";
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
			const txnRulesClient = txnRulesClientLazy.get();

			await (body.rule.id >= 0
				? txnRulesClient.updateTransactionRuleAsync(body.rule)
				: txnRulesClient.insertTransactionRulesAsync([body.rule]));

			return { statusCode: Ok };
		},
		schemata: {
			body: postTransactionRuleRequestSchema,
			params: z.unknown(),
			query: z.unknown(),
		},
	},
);
