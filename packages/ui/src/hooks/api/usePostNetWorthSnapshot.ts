import { type PostNetWorthSnapshotRequest } from "@tally/data-models/contracts/api/postNetWorthSnapshot";
import { type NetWorthSnapshot } from "@tally/data-models/contracts/netWorthSnapshot";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

export const usePostNetWorthSnapshot = () => {
	const { mutateAsync } = useMutation({
		mutationFn: async (snapshot: NetWorthSnapshot) => {
			const body: PostNetWorthSnapshotRequest = { snapshot };

			const response = await fetch("/api/net-worth/snapshots", {
				body: JSON.stringify(body),
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to update snapshot");
			}

			const responseJson: unknown = await response.json();

			return responseJson; // TODO Typing
		},
	});

	return useMemo(
		() => ({
			postSnapshotAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
