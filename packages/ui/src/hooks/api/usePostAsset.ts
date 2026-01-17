import { Post } from "@ekumlin/typescript-toolkit/http";
import { type PostAssetRequest } from "@tally/data-models/contracts/api/postAsset";
import { type Asset } from "@tally/data-models/contracts/asset";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

export const usePostAsset = () => {
	const { mutateAsync } = useMutation({
		mutationFn: async (asset: Asset) => {
			const body: PostAssetRequest = { asset };

			const response = await fetch("/api/assets", {
				body: JSON.stringify(body),
				method: Post,
			});

			if (!response.ok) {
				throw new Error("Failed to update asset");
			}

			const responseJson: unknown = await response.json();

			return responseJson; // TODO Typing
		},
	});

	return useMemo(
		() => ({
			postAssetAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
