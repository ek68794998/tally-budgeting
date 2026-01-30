import { Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { patchTransactionRulesReorderRequestSchema } from "@tally/data-models/contracts/api/patchTransactionRulesReorder";
import z from "zod";
import { TxnRulesClient } from "../../../../storage/txnRulesClient";
import { createApiHandler } from "../../../handlers/createApiHandler";
import { type NextResponseFn } from "../../../types";

const txnRulesClientLazy = new Lazy(() => new TxnRulesClient());

export const PatchTransactionsRulesOrderRouteAsync: NextResponseFn =
	createApiHandler({
		eventName: "PATCH:TRANSACTIONS/RULES/ORDER",
		handler: async ({ body }) => {
			const txnRulesClient = txnRulesClientLazy.get();

			await txnRulesClient.updateTransactionRulesOrderAsync(body.ruleIds);

			return { statusCode: Ok };
		},
		schemata: {
			body: patchTransactionRulesReorderRequestSchema,
			params: z.unknown(),
			query: z.unknown(),
		},
	});
