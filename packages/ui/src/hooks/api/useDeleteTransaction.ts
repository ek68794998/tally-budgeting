import { Delete } from "@ekumlin/typescript-toolkit/http";
import { deleteTransactionResponseSchema } from "@tally/data-models/contracts/api/deleteTransaction";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const useDeleteTransaction = () => {
	const { validateApiResponseAsync } = useApiResponseValidator();

	const { mutateAsync } = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(
				buildApiRoute(api.transactions.base, { params: [id] }),
				{ method: Delete },
			);

			const validatedResponse = await validateApiResponseAsync({
				response,
				responseSchema: deleteTransactionResponseSchema,
			});

			return validatedResponse;
		},
	});

	return useMemo(
		() => ({
			deleteTransactionAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
