import { NotFound, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import {
  putTransactionRuleParamsSchema,
  putTransactionRuleRequestSchema,
} from "@tally/data-models/contracts/api/putTransactionRule";
import z from "zod";
import { TxnRulesClient } from "../../../../storage/txnRulesClient";
import { createApiHandler } from "../../../handlers/createApiHandler";
import { HttpError } from "../../../handlers/httpError";
import { type NextResponseFn } from "../../../types";

const txnRulesClientLazy = new Lazy(() => new TxnRulesClient());

export const PutTransactionsRulesIdRouteAsync: NextResponseFn =
  createApiHandler({
    eventName: "PUT:TRANSACTIONS/RULES/[ID]",
    handler: async ({ body, params }) => {
      const wasUpdated = await txnRulesClientLazy
        .get()
        .updateTransactionRuleAsync({ ...body.rule, id: params.id });

      if (!wasUpdated) {
        throw new HttpError("Transaction rule not found", NotFound);
      }

      return { statusCode: Ok };
    },
    schemata: {
      body: putTransactionRuleRequestSchema,
      params: putTransactionRuleParamsSchema,
      query: z.unknown(),
    },
  });
