import { NotFound, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import {
  putTransactionParamsSchema,
  putTransactionRequestSchema,
} from "@tally/data-models/contracts/api/putTransaction";
import z from "zod";
import { TxnsClient } from "../../../storage/txnsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { HttpError } from "../../handlers/httpError";
import { type NextResponseFn } from "../../types";

const txnsClientLazy = new Lazy(() => new TxnsClient());

export const PutTransactionsIdRouteAsync: NextResponseFn = createApiHandler({
  eventName: "PUT:TRANSACTIONS/[ID]",
  handler: async ({ body, params }) => {
    const wasUpdated = await txnsClientLazy
      .get()
      .updateTransactionAsync({ ...body.transaction, id: params.id });

    if (!wasUpdated) {
      throw new HttpError("Transaction not found", NotFound);
    }

    return { statusCode: Ok };
  },
  schemata: {
    body: putTransactionRequestSchema,
    params: putTransactionParamsSchema,
    query: z.unknown(),
  },
});
