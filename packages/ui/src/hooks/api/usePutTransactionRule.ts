import { ContentType, Put } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
  type PutTransactionRuleRequest,
  putTransactionRuleResponseSchema,
} from "@tally/data-models/contracts/api/putTransactionRule";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import { getTransactionRuleFields } from "@tally/data-models/converters/transactionRule";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePutTransactionRule = () => {
  const { validateApiResponseAsync } = useApiResponseValidator();

  const { mutateAsync } = useMutation({
    mutationFn: async (rule: TransactionRule) => {
      const body: PutTransactionRuleRequest = {
        rule: getTransactionRuleFields(rule),
      };

      const response = await apiFetch(
        buildApiRoute(api.transactions.rules.base, {
          params: [rule.id],
        }),
        {
          body: JSON.stringify(body),
          headers: {
            [ContentType]: ApplicationJson,
          },
          method: Put,
        },
      );

      const validatedResponse = await validateApiResponseAsync({
        response,
        responseSchema: putTransactionRuleResponseSchema,
      });

      return validatedResponse;
    },
  });

  return useMemo(
    () => ({
      putTransactionRuleAsync: mutateAsync,
    }),
    [mutateAsync],
  );
};
