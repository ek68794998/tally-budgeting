import { ContentType, Put } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
  type PutTransactionRequest,
  putTransactionResponseSchema,
} from "@tally/data-models/contracts/api/putTransaction";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { withoutId } from "@tally/utilities/object/withoutId";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePutTransaction = () => {
  const { validateApiResponseAsync } = useApiResponseValidator();

  const { mutateAsync } = useMutation({
    mutationFn: async (transaction: Transaction) => {
      const body: PutTransactionRequest = {
        transaction: withoutId(transaction),
      };

      const response = await apiFetch(
        buildApiRoute(api.transactions.base, {
          params: [transaction.id],
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
        responseSchema: putTransactionResponseSchema,
      });

      return validatedResponse;
    },
  });

  return useMemo(
    () => ({
      putTransactionAsync: mutateAsync,
    }),
    [mutateAsync],
  );
};
