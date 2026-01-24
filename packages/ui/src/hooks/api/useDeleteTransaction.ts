import { Delete } from "@ekumlin/typescript-toolkit/http";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { useApiResponseValidator } from "../useApiResponseValidator";

const deleteTransactionResponseSchema = z.object({});

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
