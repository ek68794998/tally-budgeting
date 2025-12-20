import { keysOf } from "@ekumlin/typescript-toolkit/collections";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import { type Asset } from "../contracts/asset";
import { AssetTypes } from "../contracts/assetType";
import { type AssetRow } from "../database/assetRow";

export const convertAssetRowToAsset = (row: AssetRow): Asset => {
	const { active, id, name, provider, type, value } = row;

	const assetTypeKeys = keysOf(AssetTypes);
	const typeValue =
		assetTypeKeys.find((key) => AssetTypes[key] === type) ??
		assetTypeKeys[0];

	invariant(typeValue, `Asset type ${type} must be a valid asset type key.`);

	return {
		active: active > 0,
		id,
		name,
		provider,
		type: typeValue,
		value,
	};
};
