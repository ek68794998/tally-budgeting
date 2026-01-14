import { type Asset } from "../contracts/asset";
import { type AssetRow } from "../database/assetRow";

export const convertAssetRowToAsset = (row: AssetRow): Asset => {
	const { active, id, name, provider, type, value } = row;

	return {
		active,
		id,
		name,
		provider,
		type,
		valueCents: Number(value),
	};
};

export const convertAssetToAssetRow = (row: Asset): AssetRow => {
	const { active, id, name, provider, type, valueCents } = row;

	return {
		active,
		id,
		name,
		provider,
		type,
		value: String(valueCents),
	};
};
