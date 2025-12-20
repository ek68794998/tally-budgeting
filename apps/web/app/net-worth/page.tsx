import { type Asset } from "@tally/data-models/contracts/asset";
import { AssetDistribution } from "@tally/ui/netWorth/assetDistribution";
import { LiabilityDistribution } from "@tally/ui/netWorth/liabilityDistribution";
import { NetWorthCard } from "@tally/ui/netWorth/netWorthCard";
import { AssetsClient } from "../storage/assetsClient";

const assetsClient = new AssetsClient();

const NetWorthPage: React.FC = async () => {
	const assets = await assetsClient.getAssetsAsync();

	const isAsset = (asset: Asset) =>
		asset.type === "fixedAsset" ||
		asset.type === "liquidAsset" ||
		asset.type === "personalAsset";
	const netWorth = assets.reduce(
		(acc, asset) => acc + (isAsset(asset) ? 1 : -1) * asset.value,
		0,
	);

	return (
		<div className="grid grid-cols-2 gap-4">
			<NetWorthCard className="col-span-2" netWorth={netWorth} />
			<AssetDistribution assets={assets} />
			<LiabilityDistribution assets={assets} />
		</div>
	);
};

export default NetWorthPage;
