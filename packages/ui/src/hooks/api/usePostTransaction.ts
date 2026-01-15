import { type PostTransactionRequest } from "@tally/data-models/contracts/api/postTransaction";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

export const usePostTransaction = () => {
	const { mutateAsync } = useMutation({
		mutationFn: async (transaction: Transaction) => {
			const body: PostTransactionRequest = { transaction };

			const response = await fetch("/api/transactions", {
				body: JSON.stringify(body),
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to update transaction");
			}

			const responseJson: unknown = await response.json();

			return responseJson; // TODO Typing
		},
	});

	return useMemo(
		() => ({
			postTransactionAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
