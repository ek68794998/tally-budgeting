import { Created } from "@ekumlin/typescript-toolkit/http";
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
    await txnsClientLazy.get().insertTransactionsAsync([body.transaction]);

    return { statusCode: Created };
  },
  schemata: {
    body: postTransactionRequestSchema,
    params: z.unknown(),
    query: z.unknown(),
  },
});
