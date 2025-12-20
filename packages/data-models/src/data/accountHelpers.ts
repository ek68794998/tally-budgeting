import { type Asset } from "../contracts/asset";

export const isAccount = (asset: Asset): boolean =>
	asset.type !== "personalAsset" && asset.type !== "fixedAsset";
