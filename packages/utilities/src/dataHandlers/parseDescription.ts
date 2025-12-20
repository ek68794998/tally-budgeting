import { type TransactionCustomizations } from "../dataProviders/types";

export interface ParsedDescription {
	merchant: string;
	subcategoryId: number | undefined;
}

const getRecordCategoryByDescription = (
	description: string,
	{ merchants }: TransactionCustomizations,
): number | undefined =>
	merchants.find((merchant) => !!merchant.matcherRegex.exec(description))
		?.categoryId;

const getRecordMerchantByDescription = (
	description: string,
	{ merchants }: TransactionCustomizations,
): string => {
	for (const merchant of merchants) {
		const { friendlyName, matcherRegex } = merchant;

		const regexMatches = matcherRegex.exec(description);

		if (!regexMatches) {
			continue;
		}

		return friendlyName.replace("$1", regexMatches[1] ?? "");
	}

	return description;
};

export const parseDescription = (
	description: string,
	customizations: TransactionCustomizations,
): ParsedDescription => ({
	merchant: getRecordMerchantByDescription(description, customizations),
	subcategoryId: getRecordCategoryByDescription(description, customizations),
});
