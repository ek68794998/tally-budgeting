import z from "zod";
import { assetFieldsSchema } from "../asset";
import { createApiResponseSchema, idParamsSchema } from "./types";

export const putAssetParamsSchema = idParamsSchema;

export type PutAssetParams = z.infer<typeof putAssetParamsSchema>;

export const putAssetRequestSchema = z.object({
	asset: assetFieldsSchema,
});

export type PutAssetRequest = z.infer<typeof putAssetRequestSchema>;

export const putAssetResponseSchema = createApiResponseSchema({});

export type PutAssetResponse = z.infer<typeof putAssetResponseSchema>;
