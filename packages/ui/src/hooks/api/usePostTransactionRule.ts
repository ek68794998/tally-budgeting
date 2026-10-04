import { ContentType, Post } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
  type PostTransactionRuleRequest,
  postTransactionRuleResponseSchema,
} from "@tally/data-models/contracts/api/postTransactionRule";
import { type TransactionRuleFields } from "@tally/data-models/contracts/transactionRule";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePostTransactionRule = () => {
  const { validateApiResponseAsync } = useApiResponseValidator();

  const { mutateAsync } = useMutation({
    mutationFn: async (
      rule: TransactionRuleFields & { id?: never; priority?: never },
    ) => {
      const body: PostTransactionRuleRequest = { rule };

      const response = await apiFetch(
        buildApiRoute(api.transactions.rules.base),
        {
          body: JSON.stringify(body),
          headers: {
            [ContentType]: ApplicationJson,
          },
          method: Post,
        },
      );

      const validatedResponse = await validateApiResponseAsync({
        response,
        responseSchema: postTransactionRuleResponseSchema,
      });

      return validatedResponse;
    },
  });

  return useMemo(
    () => ({
      postTransactionRuleAsync: mutateAsync,
    }),
    [mutateAsync],
  );
};
