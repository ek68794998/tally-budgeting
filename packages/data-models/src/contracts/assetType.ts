import z from "zod";

export const assetTypeSchema = z.enum([
	"fixedAsset",
	"liquidAsset",
	"personalAsset",
	"longTermLiability",
	"shortTermLiability",
]);

export type AssetType = z.infer<typeof assetTypeSchema>;

export const AssetTypes = {
	fixedAsset: 0,
	liquidAsset: 1,
	longTermLiability: 3,
	personalAsset: 2,
	shortTermLiability: 4,
} as const satisfies Record<AssetType, number>;
