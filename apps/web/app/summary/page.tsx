import { SummaryCards } from "@tally/ui/summaryPage/summaryCards";
import { SubcategoriesClient } from "../storage/subcategoriesClient";
import { TransactionsClient } from "../storage/transactionsClient";
import { getSummaryDataAsync } from "./helpers";

const subcategoriesClient = new SubcategoriesClient();
const transactionsClient = new TransactionsClient();

const SummaryPage: React.FC = async () => {
	const summary = await getSummaryDataAsync(
		new Date(),
		subcategoriesClient,
		transactionsClient,
	);

	return (
		<div className="grid">
			<SummaryCards summary={summary} />
		</div>
	);
};

export default SummaryPage;
