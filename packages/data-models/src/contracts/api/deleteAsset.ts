import z from "zod";
import { idParamsSchema } from "./types";

export const deleteAssetParamsSchema = idParamsSchema;

export type DeleteAssetParams = z.infer<typeof deleteAssetParamsSchema>;

export const deleteAssetResponseSchema = z.unknown();

export type DeleteAssetResponse = z.infer<typeof deleteAssetResponseSchema>;
