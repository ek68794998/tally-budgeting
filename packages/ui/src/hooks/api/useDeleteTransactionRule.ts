import { Delete } from "@ekumlin/typescript-toolkit/http";
import { deleteTransactionRuleResponseSchema } from "@tally/data-models/contracts/api/deleteTransactionRule";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiResponseValidator } from "../useApiResponseValidator";

export const useDeleteTransactionRule = () => {
	const { validateApiResponseAsync } = useApiResponseValidator();

	const { mutateAsync } = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(
				buildApiRoute(api.transactions.rules.base, { params: [id] }),
				{ method: Delete },
			);

			const validatedResponse = await validateApiResponseAsync({
				response,
				responseSchema: deleteTransactionRuleResponseSchema,
			});

			return validatedResponse;
		},
	});

	return useMemo(
		() => ({
			deleteTransactionRuleAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
