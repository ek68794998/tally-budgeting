"use client";

import { isSuccessHttpStatusCode } from "@ekumlin/typescript-toolkit/http";
import { addToast } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { type z } from "zod";

interface ValidateApiResponseOptions<TSchema extends z.ZodType> {
	response: Response;
	responseSchema: TSchema;
}

export const useApiResponseValidator = () => {
	const t = useTranslations("error.api");

	const validateApiResponseAsync = useCallback(
		async <TSchema extends z.ZodType>(
			options: ValidateApiResponseOptions<TSchema>,
		): Promise<z.infer<TSchema> | false> => {
			const { response, responseSchema } = options;

			if (!response.ok) {
				addToast({
					color: "danger",
					description: t("errorBody"),
					title: t("errorTitle"),
				});

				// TODO (#2) Log this: API request failed with status ${response.status}
				return false;
			}

			if (!isSuccessHttpStatusCode(response.status)) {
				addToast({
					color: "danger",
					description: t("errorBody"),
					title: t("errorTitle"),
				});

				// TODO (#2) Log this: API request returned non-success status code ${response.status}
				return false;
			}

			let responseJson: unknown;

			try {
				responseJson = await response.json();
			} catch (error) {
				if (error instanceof SyntaxError) {
					// Empty response body; ignore and let parser handle it.
				} else {
					throw error;
				}
			}

			const parseResult = responseSchema.safeParse(responseJson);

			if (!parseResult.success) {
				addToast({
					color: "danger",
					description: t("validationErrorBody"),
					title: t("validationErrorTitle"),
				});

				// TODO (#2) Log this: API response validation failed: ${parseResult.error.message}
				return false;
			}

			return parseResult.data;
		},
		[t],
	);

	return { validateApiResponseAsync };
};
