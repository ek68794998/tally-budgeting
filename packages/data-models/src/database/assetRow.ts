import z from "zod";
import { accountProviderTypeSchema } from "../contracts/accountProviderType";
import { assetTypeSchema } from "../contracts/assetType";

export const assetRowSchema = z.object({
	active: z.boolean(),
	id: z.int().positive(),
	name: z.string().min(1).max(100),
	provider: accountProviderTypeSchema.nullable(),
	type: assetTypeSchema,
	value: z.string(), // BIGINT in Postgres is returned as a string.
});

export type AssetRow = z.infer<typeof assetRowSchema>;
