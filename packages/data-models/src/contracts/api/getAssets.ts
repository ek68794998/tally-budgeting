import z from "zod";
import { assetSchema } from "../asset";

export const getAssetsResponseSchema = z.object({
	assets: z.array(assetSchema),
});

export type GetAssetsResponse = z.infer<typeof getAssetsResponseSchema>;
