import { Delete } from "@ekumlin/typescript-toolkit/http";
import { deleteSubcategoryResponseSchema } from "@tally/data-models/contracts/api/deleteSubcategory";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const useDeleteSubcategory = () => {
	const { validateApiResponseAsync } = useApiResponseValidator();

	const { mutateAsync } = useMutation({
		mutationFn: async (id: number) => {
			const response = await apiFetch(
				buildApiRoute(api.categories.sub, { params: [id] }),
				{ method: Delete },
			);

			const validatedResponse = await validateApiResponseAsync({
				response,
				responseSchema: deleteSubcategoryResponseSchema,
			});

			return validatedResponse;
		},
	});

	return useMemo(
		() => ({
			deleteSubcategoryAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
