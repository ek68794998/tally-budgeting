import { calculateSummary } from "@tally/utilities/summary/calculateSummary";
import { DateTime } from "luxon";
import { type SubcategoriesClient } from "../storage/subcategoriesClient";
import { type TxnsClient } from "../storage/txnsClient";

export const getSummaryDataAsync = async (
	relativeTo: Date,
	subcategoriesClient: SubcategoriesClient,
	txnsClient: TxnsClient,
) => {
	const subcategories = await subcategoriesClient.getSubcategoriesAsync();

	const thisYear = relativeTo.getFullYear();
	const transactionsPast2Years =
		await txnsClient.getTransactionsInPeriodAsync(
			DateTime.fromObject({ day: 1, month: 1, year: thisYear - 1 }),
			DateTime.fromJSDate(relativeTo),
		);

	const summary = calculateSummary(transactionsPast2Years, subcategories, {
		currentMonth: relativeTo.getMonth(), // Last month actually
		currentYear: thisYear,
	});

	return summary;
};
