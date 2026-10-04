import { type Asset } from "../contracts/asset";

export const isAccount = (asset: Asset): boolean =>
  asset.type !== "personal_asset" && asset.type !== "fixed_asset";

export const isAsset = (asset: Asset) =>
  asset.type === "fixed_asset" ||
  asset.type === "liquid_asset" ||
  asset.type === "personal_asset";
