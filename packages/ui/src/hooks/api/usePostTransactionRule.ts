import { ContentType } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import { type PostTransactionRuleRequest } from "@tally/data-models/contracts/api/postTransactionRule";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

export const usePostTransactionRule = () => {
	const { mutateAsync } = useMutation({
		mutationFn: async (rule: TransactionRule) => {
			const body: PostTransactionRuleRequest = { rule };

			const response = await fetch("/api/transactions/rules", {
				body: JSON.stringify(body),
				headers: {
					[ContentType]: ApplicationJson,
				},
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to update transaction rule");
			}

			const responseJson: unknown = await response.json();

			return responseJson; // TODO Typing
		},
	});

	return useMemo(
		() => ({
			postTransactionRuleAsync: mutateAsync,
		}),
		[mutateAsync],
	);
};
