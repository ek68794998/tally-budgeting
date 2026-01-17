import z from "zod";
import { assetSchema } from "../asset";
import { createApiResponseSchema } from "./types";

export const postAssetRequestSchema = z.object({
	asset: assetSchema,
});

export type PostAssetRequest = z.infer<typeof postAssetRequestSchema>;

export const postAssetResponseSchema = createApiResponseSchema({});

export type PostAssetResponse = z.infer<typeof postAssetResponseSchema>;
