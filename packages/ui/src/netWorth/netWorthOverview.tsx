"use client";

import { type Asset } from "@tally/data-models/contracts/asset";
import { type NetWorthSnapshot } from "@tally/data-models/contracts/netWorthSnapshot";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useAssets } from "../hooks/store/useAssets";
import { useNetWorthSnapshots } from "../hooks/store/useNetWorthSnapshots";
import { useLatestData } from "../hooks/useLatestData";
import { AssetDistribution } from "./assetDistribution";
import { LiabilityDistribution } from "./liabilityDistribution";
import { NetWorthCard } from "./netWorthCard";

interface Props {
	initialData: {
		assets: Asset[];
		netWorthSnapshots: NetWorthSnapshot[];
	};
}

const isAsset = (asset: Asset) =>
	asset.type === "fixed_asset" ||
	asset.type === "liquid_asset" ||
	asset.type === "personal_asset";

export const NetWorthOverview: React.FC<Props> = ({ initialData }) => {
	const { assets: loadedAssets, isLoading: isLoadingAssets } = useAssets();
	const { isLoading: isLoadingSnapshots, snapshots: loadedSnapshots } =
		useNetWorthSnapshots();

	const assets = useLatestData({
		initial: initialData.assets,
		isLoading: isLoadingAssets,
		latest: loadedAssets,
	});

	const snapshots = useLatestData({
		initial: initialData.netWorthSnapshots,
		isLoading: isLoadingSnapshots,
		latest: loadedSnapshots,
	});

	const netWorthCents = assets.reduce(
		(acc, asset) => acc + (isAsset(asset) ? 1 : -1) * asset.valueCents,
		0,
	);
	const netWorth = Dollars.fromCents(netWorthCents);

	return (
		<div className="grid grid-cols-2 gap-4">
			<NetWorthCard
				className="col-span-2"
				netWorth={netWorth}
				snapshots={snapshots}
			/>
			<AssetDistribution assets={assets} />
			<LiabilityDistribution assets={assets} />
		</div>
	);
};
