import z from "zod";
import { assetSchema } from "../asset";

export const postAssetRequestSchema = z.object({
	asset: assetSchema,
});

export type PostAssetRequest = z.infer<typeof postAssetRequestSchema>;

export const postAssetResponseSchema = z.object({
	success: z.boolean(),
});

export type PostAssetResponse = z.infer<typeof postAssetResponseSchema>;
