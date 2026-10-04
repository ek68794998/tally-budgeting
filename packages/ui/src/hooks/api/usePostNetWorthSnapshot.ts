import { ContentType, Post } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
	type PostNetWorthSnapshotRequest,
	postNetWorthSnapshotResponseSchema,
} from "@tally/data-models/contracts/api/postNetWorthSnapshot";
import { type NetWorthSnapshotFields } from "@tally/data-models/contracts/netWorthSnapshot";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePostNetWorthSnapshot = () => {
	const { validateApiResponseAsync } = useApiResponseValidator();

	const { mutateAsync } = useMutation({
		mutationFn: async (
			snapshot: NetWorthSnapshotFields & { id?: never },
		) => {
			const body: PostNetWorthSnapshotRequest = { snapshot };

			const response = await apiFetch(
				buildApiRoute(api.netWorth.snapshots),
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
				responseSchema: postNetWorthSnapshotResponseSchema,
			});

			return validatedResponse;
		},
	});

	return useMemo(
		() => ({
			postSnapshotAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
