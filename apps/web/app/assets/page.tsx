import { AssetsTable } from "@tally/ui/assetsTable/assetsTable";
import { Lazy } from "@tally/utilities/lazy/lazy";
import { AssetsClient } from "../storage/assetsClient";

const assetsClientLazy = new Lazy(() => new AssetsClient());

const AssetsPage: React.FC = async () => {
	const assetsClient = assetsClientLazy.get();
	const assets = await assetsClient.getAssetsAsync();

	return (
		<div>
			<AssetsTable assets={assets} />
		</div>
	);
};

export default AssetsPage;
