import z from "zod";
import { assetSchema } from "../asset";
import { createApiResponseSchema } from "./types";

export const getAssetsResponseSchema = createApiResponseSchema({
	assets: z.array(assetSchema),
});

export type GetAssetsResponse = z.infer<typeof getAssetsResponseSchema>;
