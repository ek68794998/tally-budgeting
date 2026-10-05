import { omitKeys } from "@ekumlin/typescript-toolkit/collections";
import { ContentType, Put } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
  type PutSubcategoryRequest,
  putSubcategoryResponseSchema,
} from "@tally/data-models/contracts/api/putSubcategory";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePutSubcategory = () => {
  const { validateApiResponseAsync } = useApiResponseValidator();

  const { mutateAsync } = useMutation({
    mutationFn: async (subcategory: Subcategory) => {
      const body: PutSubcategoryRequest = {
        subcategory: omitKeys(subcategory, "id"),
      };

      const response = await apiFetch(
        buildApiRoute(api.categories.sub, { params: [subcategory.id] }),
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
        responseSchema: putSubcategoryResponseSchema,
      });

      return validatedResponse;
    },
  });

  return useMemo(
    () => ({
      putSubcategoryAsync: mutateAsync,
    }),
    [mutateAsync],
  );
};
