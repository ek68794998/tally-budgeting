import z from "zod";
import { accountProviderTypeSchema } from "../contracts/accountProviderType";
import { assetTypeSchema } from "../contracts/assetType";

export const assetRowSchema = z.object({
	/* eslint-disable @typescript-eslint/naming-convention */
	active: z.boolean(),
	id: z.number().int().positive(),
	monetary_value: z.string(),
	name: z.string(),
	provider: accountProviderTypeSchema.nullable(),
	type: assetTypeSchema,
	/* eslint-enable @typescript-eslint/naming-convention */
});

export type AssetRow = z.infer<typeof assetRowSchema>;
