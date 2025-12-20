import { calculateSummary } from "@tally/utilities/summary/calculateSummary";
import { type SubcategoriesClient } from "../storage/subcategoriesClient";
import { type TransactionsClient } from "../storage/transactionsClient";

export const getSummaryDataAsync = async (
	relativeTo: Date,
	subcategoriesClient: SubcategoriesClient,
	transactionsClient: TransactionsClient,
) => {
	const subcategories = await subcategoriesClient.getSubcategoriesAsync();

	const thisYear = relativeTo.getFullYear();
	const transactionsPast2Years =
		await transactionsClient.getTransactionsInPeriodAsync(
			new Date(thisYear - 1, 0, 1).toISOString(),
			relativeTo.toISOString(),
		);

	const summary = calculateSummary(transactionsPast2Years, subcategories, {
		currentMonth: relativeTo.getMonth(), // Last month actually
		currentYear: thisYear,
	});

	return summary;
};
