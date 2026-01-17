import { Ok } from "@ekumlin/typescript-toolkit/http";
import { type GetTransactionRulesResponse } from "@tally/data-models/contracts/api/getTransactionRules";
import { Lazy } from "@tally/utilities/lazy/lazy";
import z from "zod";
import { TxnRulesClient } from "../../../storage/txnRulesClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";

const txnRulesClientLazy = new Lazy(() => new TxnRulesClient());

export const GetTransactionsRulesRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:TRANSACTIONS/RULES",
	handler: async () => {
		const txnRulesClient = txnRulesClientLazy.get();
		const transactionRules =
			await txnRulesClient.getTransactionRulesAsync();

		const data: GetTransactionRulesResponse = {
			transactionRules,
		};

		return { data, ok: true, statusCode: Ok };
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: z.unknown(),
	},
});
