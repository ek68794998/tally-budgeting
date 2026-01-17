"use client";

import { type Asset } from "@tally/data-models/contracts/asset";
import { type NetWorthSnapshot } from "@tally/data-models/contracts/netWorthSnapshot";
import { AssetDistribution } from "@tally/ui/netWorth/assetDistribution";
import { LiabilityDistribution } from "@tally/ui/netWorth/liabilityDistribution";
import { NetWorthCard } from "@tally/ui/netWorth/netWorthCard";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useAssets } from "../hooks/store/useAssets";
import { useNetWorthSnapshots } from "../hooks/store/useNetWorthSnapshots";
import { useLatestData } from "../hooks/useLatestData";

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
	const previousNetWorthSnapshot = snapshots.sort((a, b) =>
		b.date.localeCompare(a.date),
	)[0];

	return (
		<div className="grid grid-cols-2 gap-4">
			<NetWorthCard
				className="col-span-2"
				netWorth={netWorth}
				previousNetWorthSnapshot={previousNetWorthSnapshot}
			/>
			<AssetDistribution assets={assets} />
			<LiabilityDistribution assets={assets} />
		</div>
	);
};
