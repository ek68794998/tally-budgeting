import z from "zod";
import { assetFieldsSchema } from "../asset";
import { createApiResponseSchema } from "./types";

export const postAssetRequestSchema = z.object({
	asset: assetFieldsSchema,
});

export type PostAssetRequest = z.infer<typeof postAssetRequestSchema>;

export const postAssetResponseSchema = createApiResponseSchema({});

export type PostAssetResponse = z.infer<typeof postAssetResponseSchema>;
