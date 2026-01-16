import { AssetsList } from "@tally/ui/assetsPage/assetsList";
import { NetWorthOverview } from "@tally/ui/netWorth/netWorthOverview";
import { Lazy } from "@tally/utilities/lazy/lazy";
import { AssetsClient } from "../storage/assetsClient";

const assetsClientLazy = new Lazy(() => new AssetsClient());

const AssetsPage: React.FC = async () => {
	const assetsClient = assetsClientLazy.get();
	const assets = await assetsClient.getAssetsAsync();

	return (
		<div className="flex flex-col gap-8">
			<NetWorthOverview assets={assets} />
			<AssetsList assets={assets} />
		</div>
	);
};

export default AssetsPage;
