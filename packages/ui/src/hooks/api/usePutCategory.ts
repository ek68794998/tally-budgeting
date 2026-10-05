import { omitKeys } from "@ekumlin/typescript-toolkit/collections";
import { ContentType, Put } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
  type PutCategoryRequest,
  putCategoryResponseSchema,
} from "@tally/data-models/contracts/api/putCategory";
import { type Category } from "@tally/data-models/contracts/category";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePutCategory = () => {
  const { validateApiResponseAsync } = useApiResponseValidator();

  const { mutateAsync } = useMutation({
    mutationFn: async (category: Category) => {
      const body: PutCategoryRequest = { category: omitKeys(category, "id") };

      const response = await apiFetch(
        buildApiRoute(api.categories.base, { params: [category.id] }),
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
        responseSchema: putCategoryResponseSchema,
      });

      return validatedResponse;
    },
  });

  return useMemo(
    () => ({
      putCategoryAsync: mutateAsync,
    }),
    [mutateAsync],
  );
};
