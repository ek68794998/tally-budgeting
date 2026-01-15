"use client";

import { useDisclosure } from "@heroui/react";
import { type Asset } from "@tally/data-models/contracts/asset";
import { useState } from "react";
import { ModalDefaultAsset } from "../common/modalDefault";
import { useDeleteAsset } from "../hooks/api/useDeleteAsset";
import { usePostAsset } from "../hooks/api/usePostAsset";
import { AssetCard } from "./assetCard";
import { AssetEditModal } from "./assetEditModal";
import { AssetsTableControls } from "./assetsTableControls";

interface Props {
	assets: Asset[];
}

export const AssetsTable: React.FC<Props> = ({ assets }) => {
	const editModalState = useDisclosure();
	const { deleteAssetAsync } = useDeleteAsset();
	const { postAssetAsync } = usePostAsset();

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
		.sort((a, b) => {
			if (a.active && !b.active) {
				return -1;
			}

			if (!a.active && b.active) {
				return 1;
			}

			return a.name.localeCompare(b.name);
		});

	const handleDelete = async (asset: Asset) => {
		await deleteAssetAsync(asset.id);
	};

	const handleEdit = (asset: Asset) => {
		setActiveAsset(asset);
		editModalState.onOpen();
	};

	const handleSaveAsync = async (asset: Asset) => {
		await postAssetAsync(asset);
		setActiveAsset(null);
	};

	const handleSetActive = async (asset: Asset, value: boolean) => {
		const assetToSave: Asset = {
			...asset,
			active: value,
		};

		await handleSaveAsync(assetToSave);
	};

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
						onSetActive={(value) =>
							void handleSetActive(asset, value)
						}
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
