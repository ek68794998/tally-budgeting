import z from "zod";

export const txnRuleRowSchema = z.object({
	active: z.boolean(),
	flags: z.string(),
	id: z.int().positive(),
	merchant: z.string(),
	pattern: z.string().min(1).max(100),
	priority: z.int(),
	subcategory: z.int(),
});

export type TxnRuleRow = z.infer<typeof txnRuleRowSchema>;
