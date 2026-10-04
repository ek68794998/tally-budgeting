import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { deleteTransactionRuleParamsSchema } from "@tally/data-models/contracts/api/deleteTransactionRule";
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
      await txnRulesClient.deleteTransactionRuleAsync(id);

      return { statusCode: NoContent };
    },
    schemata: {
      body: z.unknown(),
      params: deleteTransactionRuleParamsSchema,
      query: z.unknown(),
    },
  });
