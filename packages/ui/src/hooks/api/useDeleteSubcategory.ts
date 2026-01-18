import { Delete } from "@ekumlin/typescript-toolkit/http";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

export const useDeleteSubcategory = () => {
	const { mutateAsync } = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/categories/sub/${id}`, {
				method: Delete,
			});

			if (!response.ok) {
				throw new Error("Failed to delete subcategory");
			}

			const responseJson: unknown = await response.json();

			return responseJson; // TODO Typing
		},
	});

	return useMemo(
		() => ({
			deleteSubcategoryAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
