import { AssetsTable } from "@tally/ui/assetsTable/assetsTable";
import { AssetsClient } from "../storage/assetsClient";

const assetsClient = new AssetsClient();

const AssetsPage: React.FC = async () => {
	const assets = await assetsClient.getAssetsAsync();

	return (
		<div>
			<AssetsTable assets={assets} />
		</div>
	);
};

export default AssetsPage;
