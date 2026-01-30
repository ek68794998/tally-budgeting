"use client";

import { invariant } from "@ekumlin/typescript-toolkit/values";
import { useDisclosure } from "@heroui/react";
import { type Asset } from "@tally/data-models/contracts/asset";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ConfirmationModal } from "../common/confirmationModal";
import { ModalDefaultAsset } from "../common/modalDefault";
import { filterMatches } from "../filter";
import { useDeleteAsset } from "../hooks/api/useDeleteAsset";
import { usePostAsset } from "../hooks/api/usePostAsset";
import { useAssets } from "../hooks/store/useAssets";
import { AssetCard } from "./assetCard";
import { AssetEditModal } from "./assetEditModal";
import { AssetsTableControls } from "./assetsTableControls";

interface Props {
	assets: Asset[];
}

export const AssetsTable: React.FC<Props> = ({ assets }) => {
	const { refetch } = useAssets();
	const deleteModalState = useDisclosure();
	const editModalState = useDisclosure();
	const { deleteAssetAsync } = useDeleteAsset();
	const { postAssetAsync } = usePostAsset();
	const t = useTranslations("assets");

	const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
	const [filterValue, setFilterValue] = useState("");

	const displayedAssets = assets
		.filter((a) => filterMatches(filterValue, a.name))
		.sort((a, b) => {
			if (a.active && !b.active) {
				return -1;
			}

			if (!a.active && b.active) {
				return 1;
			}

			return a.name.localeCompare(b.name);
		});

	const handleDeleteAsync = async (asset: Asset) => {
		await deleteAssetAsync(asset.id);
		setActiveAsset(null);

		void refetch();
	};

	const handleSaveAsync = async (asset: Asset) => {
		await postAssetAsync(asset);
		setActiveAsset(null);

		void refetch();
	};

	const handleStartDelete = (asset: Asset) => {
		setActiveAsset(asset);
		deleteModalState.onOpen();
	};

	const handleStartEdit = (asset: Asset) => {
		setActiveAsset(asset);
		editModalState.onOpen();
	};

	const handleSetActiveAsync = async (asset: Asset, value: boolean) => {
		const assetToSave: Asset = {
			...asset,
			active: value,
		};

		await handleSaveAsync(assetToSave);
	};

	return (
		<div className="@container flex flex-col gap-4">
			<AssetsTableControls
				onFilterChange={setFilterValue}
				onNewAsset={() => handleStartEdit(ModalDefaultAsset)}
			/>
			<div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3 @7xl:grid-cols-4">
				{displayedAssets.map((asset) => (
					<AssetCard
						asset={asset}
						key={asset.id}
						onDelete={() => handleStartDelete(asset)}
						onEdit={() => handleStartEdit(asset)}
						onSetActive={(value) =>
							void handleSetActiveAsync(asset, value)
						}
					/>
				))}
			</div>
			<ConfirmationModal
				body={t("listControls.deleteBody", {
					merchant: activeAsset?.name ?? "",
				})}
				confirmText={t("listControls.deleteAction")}
				isDestructive={true}
				modalState={deleteModalState}
				onConfirmAsync={async () => {
					invariant(activeAsset, "Active rule must be defined");
					await handleDeleteAsync(activeAsset);
				}}
				title={t("listControls.deleteTitle")}
			/>
			<AssetEditModal
				asset={activeAsset}
				modalState={editModalState}
				onSaveAsync={handleSaveAsync}
			/>
		</div>
	);
};
