import { Delete } from "@ekumlin/typescript-toolkit/http";
import { deleteCategoryResponseSchema } from "@tally/data-models/contracts/api/deleteCategory";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const useDeleteCategory = () => {
	const { validateApiResponseAsync } = useApiResponseValidator();

	const { mutateAsync } = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(
				buildApiRoute(api.categories.base, { params: [id] }),
				{ method: Delete },
			);

			const validatedResponse = await validateApiResponseAsync({
				response,
				responseSchema: deleteCategoryResponseSchema,
			});

			return validatedResponse;
		},
	});

	return useMemo(
		() => ({
			deleteCategoryAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
