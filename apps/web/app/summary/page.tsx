import { SummaryCards } from "@tally/ui/summaryPage/summaryCards";
import { SubcategoriesClient } from "../storage/subcategoriesClient";
import { TxnsClient } from "../storage/txnsClient";
import { getSummaryDataAsync } from "./helpers";

const subcategoriesClient = new SubcategoriesClient();
const txnsClient = new TxnsClient();

const SummaryPage: React.FC = async () => {
	const summary = await getSummaryDataAsync(
		new Date(),
		subcategoriesClient,
		txnsClient,
	);

	return (
		<div className="grid">
			<SummaryCards summary={summary} />
		</div>
	);
};

export default SummaryPage;
