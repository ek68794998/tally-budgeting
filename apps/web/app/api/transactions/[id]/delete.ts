import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { deleteTransactionParamsSchema } from "@tally/data-models/contracts/api/deleteTransaction";
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
    await txnsClient.deleteTransactionAsync(id);

    return { statusCode: NoContent };
  },
  schemata: {
    body: z.unknown(),
    params: deleteTransactionParamsSchema,
    query: z.unknown(),
  },
});
