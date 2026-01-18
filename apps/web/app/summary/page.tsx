import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { SummaryCards } from "@tally/ui/summaryPage/summaryCards";
import { SubcategoriesClient } from "../storage/subcategoriesClient";
import { TxnsClient } from "../storage/txnsClient";
import { getSummaryDataAsync } from "./helpers";

const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());
const txnsClientLazy = new Lazy(() => new TxnsClient());

const SummaryPage: React.FC = async () => {
	const subcategoriesClient = subcategoriesClientLazy.get();
	const txnsClient = txnsClientLazy.get();

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
