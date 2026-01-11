import z from "zod";
import { accountProviderTypeSchema } from "./accountProviderType";
import { assetTypeSchema } from "./assetType";

export const assetSchema = z.object({
	active: z.boolean(),
	id: z.int(),
	name: z.string().min(1).max(100),
	provider: accountProviderTypeSchema.nullable(),
	type: assetTypeSchema,
	valueCents: z.int(),
});

export type Asset = z.infer<typeof assetSchema>;
