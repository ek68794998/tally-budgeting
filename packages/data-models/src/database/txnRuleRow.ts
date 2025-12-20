import z from "zod";

export const txnRuleRowSchema = z.object({
	/* eslint-disable @typescript-eslint/naming-convention */
	flags: z.string(),
	id: z.number().int().positive(),
	is_active: z.boolean(),
	merchant: z.string(),
	pattern: z.string().min(1).max(100),
	priority: z.number().int(),
	subcategory: z.number().int(),
	/* eslint-enable @typescript-eslint/naming-convention */
});

export type TxnRuleRow = z.infer<typeof txnRuleRowSchema>;
