import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { AssetsList } from "@tally/ui/assetsPage/assetsList";
import { NetWorthOverview } from "@tally/ui/netWorth/netWorthOverview";
import { AssetsClient } from "../storage/assetsClient";
import { NetWorthSnapshotsClient } from "../storage/netWorthSnapshotsClient";

const assetsClientLazy = new Lazy(() => new AssetsClient());
const netWorthSnapshotsClientLazy = new Lazy(
	() => new NetWorthSnapshotsClient(),
);

const AssetsPage: React.FC = async () => {
	const assetsClient = assetsClientLazy.get();
	const assets = await assetsClient.getAssetsAsync();

	const netWorthSnapshotsClient = netWorthSnapshotsClientLazy.get();
	const netWorthSnapshots =
		await netWorthSnapshotsClient.getNetWorthSnapshotsAsync();

	return (
		<div className="flex flex-col gap-8">
			<NetWorthOverview initialData={{ assets, netWorthSnapshots }} />
			<AssetsList initialData={{ assets }} />
		</div>
	);
};

export default AssetsPage;
