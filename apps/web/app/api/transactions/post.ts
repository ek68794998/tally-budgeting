import { Ok } from "@ekumlin/typescript-toolkit/http";
import {
	type PostTransactionResponse,
	postTransactionRequestSchema,
} from "@tally/data-models/contracts/api/postTransaction";
import z from "zod";
import { TxnsClient } from "../../storage/txnsClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type NextResponseFn } from "../types";

const txnsClient = new TxnsClient();

export const PostTransactionsRouteAsync: NextResponseFn = createApiHandler({
	eventName: "POST:TRANSACTIONS",
	handler: async ({ body }) => {
		await (body.transaction.id >= 0
			? txnsClient.updateTransactionAsync(body.transaction)
			: txnsClient.insertTransactionsAsync([body.transaction]));

		const data: PostTransactionResponse = { success: true };

		return {
			data,
			ok: true,
			statusCode: Ok,
		};
	},
	schemata: {
		body: postTransactionRequestSchema,
		params: z.unknown(),
		query: z.unknown(),
	},
});
