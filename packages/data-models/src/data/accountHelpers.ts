import { type Asset } from "../contracts/asset";

export const isAccount = (asset: Asset): boolean =>
	asset.type !== "personal_asset" && asset.type !== "fixed_asset";
