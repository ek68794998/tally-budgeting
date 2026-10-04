import { ContentType, Post } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
  type PostAssetRequest,
  postAssetResponseSchema,
} from "@tally/data-models/contracts/api/postAsset";
import { type AssetFields } from "@tally/data-models/contracts/asset";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePostAsset = () => {
  const { validateApiResponseAsync } = useApiResponseValidator();

  const { mutateAsync } = useMutation({
    mutationFn: async (asset: AssetFields & { id?: never }) => {
      const body: PostAssetRequest = { asset };

      const response = await apiFetch(buildApiRoute(api.assets), {
        body: JSON.stringify(body),
        headers: {
          [ContentType]: ApplicationJson,
        },
        method: Post,
      });

      const validatedResponse = await validateApiResponseAsync({
        response,
        responseSchema: postAssetResponseSchema,
      });

      return validatedResponse;
    },
  });

  return useMemo(
    () => ({
      postAssetAsync: mutateAsync,
    }),
    [mutateAsync],
  );
};
