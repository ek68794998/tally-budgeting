import { type Asset } from "@tally/data-models/contracts/asset";
import { AssetDistribution } from "@tally/ui/netWorth/assetDistribution";
import { LiabilityDistribution } from "@tally/ui/netWorth/liabilityDistribution";
import { NetWorthCard } from "@tally/ui/netWorth/netWorthCard";
import { Dollars } from "@tally/utilities/financial/dollars";
import { Lazy } from "@tally/utilities/lazy/lazy";
import { AssetsClient } from "../storage/assetsClient";

const assetsClientLazy = new Lazy(() => new AssetsClient());

const NetWorthPage: React.FC = async () => {
	const assetsClient = assetsClientLazy.get();
	const assets = await assetsClient.getAssetsAsync();

	const isAsset = (asset: Asset) =>
		asset.type === "fixed_asset" ||
		asset.type === "liquid_asset" ||
		asset.type === "personal_asset";

	const netWorthCents = assets.reduce(
		(acc, asset) => acc + (isAsset(asset) ? 1 : -1) * asset.valueCents,
		0,
	);
	const netWorth = Dollars.fromCents(netWorthCents);

	return (
		<div className="grid grid-cols-2 gap-4">
			<NetWorthCard className="col-span-2" netWorth={netWorth} />
			<AssetDistribution assets={assets} />
			<LiabilityDistribution assets={assets} />
		</div>
	);
};

export default NetWorthPage;
