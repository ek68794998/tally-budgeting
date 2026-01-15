import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

export const useDeleteAsset = () => {
	const { mutateAsync } = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/assets/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete asset");
			}

			const responseJson: unknown = await response.json();

			return responseJson; // TODO Typing
		},
	});

	return useMemo(
		() => ({
			deleteAssetAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
