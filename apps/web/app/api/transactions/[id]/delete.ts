import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { deleteTransactionRuleParamsSchema } from "@tally/data-models/contracts/api/deleteTransactionRule";
import z from "zod";
import { TxnsClient } from "../../../storage/txnsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";

const txnsClientLazy = new Lazy(() => new TxnsClient());

export const DeleteTransactionsIdRouteAsync: NextResponseFn = createApiHandler({
	eventName: "DELETE:TRANSACTIONS/[ID]",
	handler: async ({ params }) => {
		const { id } = params;

		const txnsClient = txnsClientLazy.get();

		const idNumber = parseInt(id, 10);
		await txnsClient.deleteTransactionAsync(idNumber);

		return { statusCode: NoContent };
	},
	schemata: {
		body: z.unknown(),
		params: deleteTransactionRuleParamsSchema,
		query: z.unknown(),
	},
});
