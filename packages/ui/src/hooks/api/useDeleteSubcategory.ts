import { Delete } from "@ekumlin/typescript-toolkit/http";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { useApiResponseValidator } from "../useApiResponseValidator";

const deleteSubcategoryResponseSchema = z.object({});

export const useDeleteSubcategory = () => {
	const { validateApiResponseAsync } = useApiResponseValidator();

	const { mutateAsync } = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(
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
