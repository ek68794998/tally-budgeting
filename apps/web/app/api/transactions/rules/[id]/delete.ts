import { Ok } from "@ekumlin/typescript-toolkit/http";
import { deleteTransactionRuleParamsSchema } from "@tally/data-models/contracts/api/deleteTransactionRule";
import { Lazy } from "@tally/utilities/lazy/lazy";
import z from "zod";
import { TxnRulesClient } from "../../../../storage/txnRulesClient";
import { createApiHandler } from "../../../handlers/createApiHandler";
import { type NextResponseFn } from "../../../types";

const txnRulesClientLazy = new Lazy(() => new TxnRulesClient());

export const DeleteTransactionsRulesIdRouteAsync: NextResponseFn =
	createApiHandler({
		eventName: "DELETE:TRANSACTIONS/RULES/[ID]",
		handler: async ({ params }) => {
			const { id } = params;

			const txnRulesClient = txnRulesClientLazy.get();

			const idNumber = parseInt(id, 10);
			await txnRulesClient.deleteTransactionRuleAsync(idNumber);

			return {
				data: null,
				ok: true,
				statusCode: Ok,
			};
		},
		schemata: {
			body: z.unknown(),
			params: deleteTransactionRuleParamsSchema,
			query: z.unknown(),
		},
	});
