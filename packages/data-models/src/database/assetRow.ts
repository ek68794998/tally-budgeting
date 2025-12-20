import z from "zod";
import { accountProviderTypeSchema } from "../contracts/accountProviderType";

export const assetRowSchema = z.object({
	active: z.int(),
	id: z.int(),
	name: z.string(),
	provider: accountProviderTypeSchema.nullable(),
	type: z.number(),
	value: z.number().min(0),
});

export type AssetRow = z.infer<typeof assetRowSchema>;
