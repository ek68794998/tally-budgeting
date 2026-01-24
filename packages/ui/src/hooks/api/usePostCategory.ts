import { ContentType, Post } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
	type PostCategoryRequest,
	postCategoryResponseSchema,
} from "@tally/data-models/contracts/api/postCategory";
import { type Category } from "@tally/data-models/contracts/category";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePostCategory = () => {
	const { validateApiResponseAsync } = useApiResponseValidator();

	const { mutateAsync } = useMutation({
		mutationFn: async (category: Category) => {
			const body: PostCategoryRequest = { category };

			const response = await fetch(buildApiRoute(api.categories.base), {
				body: JSON.stringify(body),
				headers: {
					[ContentType]: ApplicationJson,
				},
				method: Post,
			});

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
