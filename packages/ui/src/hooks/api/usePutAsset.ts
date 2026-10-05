import { omitKeys } from "@ekumlin/typescript-toolkit/collections";
import { ContentType, Put } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
  type PutAssetRequest,
  putAssetResponseSchema,
} from "@tally/data-models/contracts/api/putAsset";
import { type Asset } from "@tally/data-models/contracts/asset";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePutAsset = () => {
  const { validateApiResponseAsync } = useApiResponseValidator();

  const { mutateAsync } = useMutation({
    mutationFn: async (asset: Asset) => {
      const body: PutAssetRequest = { asset: omitKeys(asset, "id") };

      const response = await apiFetch(
        buildApiRoute(api.assets, { params: [asset.id] }),
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
        responseSchema: putAssetResponseSchema,
      });

      return validatedResponse;
    },
  });

  return useMemo(
    () => ({
      putAssetAsync: mutateAsync,
    }),
    [mutateAsync],
  );
};
