import { Post } from "@ekumlin/typescript-toolkit/http";
import { type PostSubcategoryRequest } from "@tally/data-models/contracts/api/postSubcategory";
import { type Subcategory } from "@tally/data-models/contracts/Subcategory";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

export const usePostSubcategory = () => {
	const { mutateAsync } = useMutation({
		mutationFn: async (subcategory: Subcategory) => {
			const body: PostSubcategoryRequest = { subcategory };

			const response = await fetch("/api/categories/sub", {
				body: JSON.stringify(body),
				method: Post,
			});

			if (!response.ok) {
				throw new Error("Failed to update subcategory");
			}

			const responseJson: unknown = await response.json();

			return responseJson; // TODO Typing
		},
	});

	return useMemo(
		() => ({
			postSubcategoryAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
