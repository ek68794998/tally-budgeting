import { ContentType, Post } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
	type PostCategoryRequest,
	postCategoryResponseSchema,
} from "@tally/data-models/contracts/api/postCategory";
import { type CategoryFields } from "@tally/data-models/contracts/category";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePostCategory = () => {
	const { validateApiResponseAsync } = useApiResponseValidator();

	const { mutateAsync } = useMutation({
		mutationFn: async (category: CategoryFields & { id?: never }) => {
			const body: PostCategoryRequest = { category };

			const response = await apiFetch(
				buildApiRoute(api.categories.base),
				{
					body: JSON.stringify(body),
					headers: {
						[ContentType]: ApplicationJson,
					},
					method: Post,
				},
			);

			const validatedResponse = await validateApiResponseAsync({
				response,
				responseSchema: postCategoryResponseSchema,
			});

			return validatedResponse;
		},
	});

	return useMemo(
		() => ({
			postCategoryAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
