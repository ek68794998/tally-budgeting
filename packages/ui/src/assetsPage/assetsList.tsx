"use client";

import { type Asset } from "@tally/data-models/contracts/asset";
import { AssetsTable } from "@tally/ui/assetsTable/assetsTable";
import { useTranslations } from "next-intl";
import { useAssets } from "../hooks/store/useAssets";
import { useLatestData } from "../hooks/useLatestData";

interface Props {
	assets: Asset[];
}

export const AssetsList: React.FC<Props> = ({ assets: initialAssets }) => {
	const { assets: loadedAssets, isLoading } = useAssets();
	const t = useTranslations("assets");

	const assets = useLatestData({
		initial: initialAssets,
		isLoading,
		latest: loadedAssets,
	});

	return (
		<div>
			<h2 className="mb-2 text-2xl font-black">{t("listTitle")}</h2>
			<AssetsTable assets={assets} />
		</div>
	);
};
