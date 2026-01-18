import { Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { postTransactionRequestSchema } from "@tally/data-models/contracts/api/postTransaction";
import z from "zod";
import { TxnsClient } from "../../storage/txnsClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type NextResponseFn } from "../types";

const txnsClientLazy = new Lazy(() => new TxnsClient());

export const PostTransactionsRouteAsync: NextResponseFn = createApiHandler({
	eventName: "POST:TRANSACTIONS",
	handler: async ({ body }) => {
		const txnsClient = txnsClientLazy.get();

		await (body.transaction.id >= 0
			? txnsClient.updateTransactionAsync(body.transaction)
			: txnsClient.insertTransactionsAsync([body.transaction]));

		return { statusCode: Ok };
	},
	schemata: {
		body: postTransactionRequestSchema,
		params: z.unknown(),
		query: z.unknown(),
	},
});
