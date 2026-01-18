import { Post } from "@ekumlin/typescript-toolkit/http";
import { type PostCategoryRequest } from "@tally/data-models/contracts/api/postCategory";
import { type Category } from "@tally/data-models/contracts/category";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

export const usePostCategory = () => {
	const { mutateAsync } = useMutation({
		mutationFn: async (category: Category) => {
			const body: PostCategoryRequest = { category };

			const response = await fetch("/api/categories", {
				body: JSON.stringify(body),
				method: Post,
			});

			if (!response.ok) {
				throw new Error("Failed to update category");
			}

			const responseJson: unknown = await response.json();

			return responseJson; // TODO Typing
		},
	});

	return useMemo(
		() => ({
			postCategoryAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
