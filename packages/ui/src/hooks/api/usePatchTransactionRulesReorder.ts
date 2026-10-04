import { ContentType, Patch } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
  type PatchTransactionRulesReorderRequest,
  patchTransactionRulesReorderResponseSchema,
} from "@tally/data-models/contracts/api/patchTransactionRulesReorder";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePatchTransactionRulesReorder = () => {
  const { validateApiResponseAsync } = useApiResponseValidator();

  const { mutateAsync } = useMutation({
    mutationFn: async (ruleIds: number[]) => {
      const body: PatchTransactionRulesReorderRequest = { ruleIds };

      const response = await apiFetch(
        buildApiRoute(api.transactions.rules.order),
        {
          body: JSON.stringify(body),
          headers: {
            [ContentType]: ApplicationJson,
          },
          method: Patch,
        },
      );

      const validatedResponse = await validateApiResponseAsync({
        response,
        responseSchema: patchTransactionRulesReorderResponseSchema,
      });

      return validatedResponse;
    },
  });

  return useMemo(
    () => ({
      patchTransactionRulesReorderAsync: mutateAsync,
    }),
    [mutateAsync],
  );
};
