import z from "zod";
import { accountProviderTypeSchema } from "../contracts/accountProviderType";
import { assetTypeSchema } from "../contracts/assetType";

export const assetRowSchema = z.object({
	active: z.boolean(),
	id: z.int(),
	name: z.string().min(1).max(100),
	provider: accountProviderTypeSchema.nullable(),
	type: assetTypeSchema,
	value_cents: z.string() /* BIGINT -> string */, // eslint-disable-line @typescript-eslint/naming-convention
});

export type AssetRow = z.infer<typeof assetRowSchema>;
