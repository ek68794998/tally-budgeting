import { Delete } from "@ekumlin/typescript-toolkit/http";
import { deleteAssetResponseSchema } from "@tally/data-models/contracts/api/deleteAsset";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const useDeleteAsset = () => {
	const { validateApiResponseAsync } = useApiResponseValidator();

	const { mutateAsync } = useMutation({
		mutationFn: async (id: number) => {
			const response = await apiFetch(
				buildApiRoute(api.assets, { params: [id] }),
				{ method: Delete },
			);

			const validatedResponse = await validateApiResponseAsync({
				response,
				responseSchema: deleteAssetResponseSchema,
			});

			return validatedResponse;
		},
	});

	return useMemo(
		() => ({
			deleteAssetAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
