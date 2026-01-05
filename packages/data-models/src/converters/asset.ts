import { type Asset } from "../contracts/asset";
import { type AssetRow } from "../database/assetRow";

export const convertAssetRowToAsset = (row: AssetRow): Asset => {
	const { active, id, name, provider, type, value_cents: valueCents } = row;

	return {
		active,
		id,
		name,
		provider,
		type,
		valueCents,
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
		value_cents: valueCents, // eslint-disable-line @typescript-eslint/naming-convention
	};
};
