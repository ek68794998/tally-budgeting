"use client";

import { useDisclosure } from "@heroui/react";
import { type Asset } from "@tally/data-models/contracts/asset";
import { useState } from "react";
import { ModalDefaultAsset } from "../common/modalDefault";
import { AssetCard } from "./assetCard";
import { AssetEditModal } from "./assetEditModal";
import { AssetsTableControls } from "./assetsTableControls";

interface Props {
	assets: Asset[];
}

export const AssetsTable: React.FC<Props> = ({ assets }) => {
	const editModalState = useDisclosure();

	const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
	const [filterValue, setFilterValue] = useState("");

	const displayedAssets = assets
		.filter(
			(a) =>
				!filterValue ||
				a.name
					.toLocaleLowerCase()
					.includes(filterValue.toLocaleLowerCase()),
		)
		.sort((a, b) => a.name.localeCompare(b.name));

	const handleDelete = (_asset: Asset) => {
		// TODO Implement delete logic here
	};

	const handleEdit = (asset: Asset) => {
		setActiveAsset(asset);
		editModalState.onOpen();
	};

	const handleSaveAsync = (_asset: Asset) =>
		new Promise<void>((resolve) => {
			// TODO Implement save logic here
			setTimeout(() => {
				setActiveAsset(null);
				resolve();
			}, 1000);
		});

	return (
		<div className="flex flex-col gap-4">
			<AssetsTableControls
				onFilterChange={setFilterValue}
				onNewAsset={() => handleEdit(ModalDefaultAsset)}
			/>
			<div className="grid grid-cols-3 gap-4">
				{displayedAssets.map((asset) => (
					<AssetCard
						asset={asset}
						key={asset.id}
						onDelete={() => handleDelete(asset)}
						onEdit={() => handleEdit(asset)}
					/>
				))}
			</div>
			<AssetEditModal
				asset={activeAsset}
				modalState={editModalState}
				onSaveAsync={handleSaveAsync}
			/>
		</div>
	);
};
