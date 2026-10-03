import { ContentType, Post } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
	type PostTransactionRequest,
	postTransactionResponseSchema,
} from "@tally/data-models/contracts/api/postTransaction";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const usePostTransaction = () => {
	const { validateApiResponseAsync } = useApiResponseValidator();

	const { mutateAsync } = useMutation({
		mutationFn: async (transaction: Transaction) => {
			const body: PostTransactionRequest = { transaction };

			const response = await apiFetch(
				buildApiRoute(api.transactions.base),
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
				responseSchema: postTransactionResponseSchema,
			});

			return validatedResponse;
		},
	});

	return useMemo(
		() => ({
			postTransactionAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
