import { type Asset, type AssetFields } from "../contracts/asset";
import { type AssetRow } from "../database/assetRow";

export const convertAssetRowToAsset = (row: AssetRow): Asset => {
  const { active, id, name, provider, type, value_cents: value } = row;

  return {
    active,
    id,
    name,
    provider,
    type,
    valueCents: Number(value),
  };
};

export const convertAssetFieldsToAssetRow = (
  row: AssetFields,
): Omit<AssetRow, "id"> => {
  const { active, name, provider, type, valueCents } = row;

  return {
    active,
    name,
    provider,
    type,
    value_cents: String(valueCents), // eslint-disable-line @typescript-eslint/naming-convention
  };
};

export const convertAssetToAssetRow = (asset: Asset): AssetRow => ({
  ...convertAssetFieldsToAssetRow(asset),
  id: asset.id,
});
