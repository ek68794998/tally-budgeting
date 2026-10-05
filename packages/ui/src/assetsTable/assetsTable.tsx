"use client";

import { omitKeys } from "@ekumlin/typescript-toolkit/collections";
import { includesIgnoreCase } from "@ekumlin/typescript-toolkit/string";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import { useDisclosure } from "@heroui/react";
import { type Asset } from "@tally/data-models/contracts/asset";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ConfirmationModal } from "../common/confirmationModal";
import { ModalDefaultAsset } from "../common/modalDefault";
import { useDeleteAsset } from "../hooks/api/useDeleteAsset";
import { usePostAsset } from "../hooks/api/usePostAsset";
import { usePutAsset } from "../hooks/api/usePutAsset";
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
  const { putAssetAsync } = usePutAsset();
  const t = useTranslations("assets");

  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [isNewAsset, setIsNewAsset] = useState(false);
  const [filterValue, setFilterValue] = useState("");

  const displayedAssets = assets
    .filter((a) => includesIgnoreCase(a.name, filterValue))
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
    setAssetToDelete(null);

    void refetch();
  };

  const handleSaveAsync = async (asset: Asset) => {
    await (isNewAsset
      ? postAssetAsync(omitKeys(asset, "id"))
      : putAssetAsync(asset));
    editModalState.onClose();
    setAssetToEdit(null);

    void refetch();
  };

  const handleStartDelete = (asset: Asset) => {
    setAssetToDelete(asset);
    deleteModalState.onOpen();
  };

  const handleStartEdit = (asset: Asset, isNew = false) => {
    setAssetToEdit(asset);
    setIsNewAsset(isNew);
    editModalState.onOpen();
  };

  const handleSetActiveAsync = async (asset: Asset, value: boolean) => {
    await putAssetAsync({ ...asset, active: value });

    void refetch();
  };

  return (
    <div className="@container flex flex-col gap-4">
      <AssetsTableControls
        onFilterChange={setFilterValue}
        onNewAsset={() => handleStartEdit(ModalDefaultAsset, true)}
      />
      <div
        className="
          grid grid-cols-1 gap-4
          @xl:grid-cols-2
          @4xl:grid-cols-3
          @7xl:grid-cols-4
        "
      >
        {displayedAssets.map((asset) => (
          <AssetCard
            asset={asset}
            key={asset.id}
            onDelete={() => handleStartDelete(asset)}
            onEdit={() => handleStartEdit(asset)}
            onSetActive={(value) => void handleSetActiveAsync(asset, value)}
          />
        ))}
      </div>
      <ConfirmationModal
        body={t("listControls.deleteBody", {
          merchant: assetToDelete?.name ?? "",
        })}
        confirmText={t("listControls.deleteAction")}
        isDestructive={true}
        modalState={deleteModalState}
        onConfirmAsync={async () => {
          invariant(assetToDelete, "Asset to delete must be defined");
          await handleDeleteAsync(assetToDelete);
        }}
        title={t("listControls.deleteTitle")}
      />
      <AssetEditModal
        asset={assetToEdit}
        isNew={isNewAsset}
        modalState={editModalState}
        onSaveAsync={handleSaveAsync}
      />
    </div>
  );
};
