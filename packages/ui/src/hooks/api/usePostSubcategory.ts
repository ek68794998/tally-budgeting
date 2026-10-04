import { ContentType, Post } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
  type PostSubcategoryRequest,
  postSubcategoryResponseSchema,
} from "@tally/data-models/contracts/api/postSubcategory";
import { type SubcategoryFields } from "@tally/data-models/contracts/subcategory";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePostSubcategory = () => {
  const { validateApiResponseAsync } = useApiResponseValidator();

  const { mutateAsync } = useMutation({
    mutationFn: async (subcategory: SubcategoryFields & { id?: never }) => {
      const body: PostSubcategoryRequest = { subcategory };

      const response = await apiFetch(buildApiRoute(api.categories.sub), {
        body: JSON.stringify(body),
        headers: {
          [ContentType]: ApplicationJson,
        },
        method: Post,
      });

      const validatedResponse = await validateApiResponseAsync({
        response,
        responseSchema: postSubcategoryResponseSchema,
      });

      return validatedResponse;
    },
  });

  return useMemo(
    () => ({
      postSubcategoryAsync: mutateAsync,
    }),
    [mutateAsync],
  );
};
