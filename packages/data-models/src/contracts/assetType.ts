import z from "zod";

export const AssetTypeKeys = [
	"fixed_asset",
	"liquid_asset",
	"personal_asset",
	"long_term_liability",
	"short_term_liability",
] as const;

export const assetTypeSchema = z.enum(AssetTypeKeys);

export type AssetType = z.infer<typeof assetTypeSchema>;
