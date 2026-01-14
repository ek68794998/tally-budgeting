import z from "zod";

export const txnRuleRowSchema = z.object({
	flags: z.string(),
	id: z.int(),
	is_active: z.boolean(), // eslint-disable-line @typescript-eslint/naming-convention
	merchant: z.string(),
	pattern: z.string().min(1).max(100),
	priority: z.int(),
	subcategory: z.int(),
});

export type TxnRuleRow = z.infer<typeof txnRuleRowSchema>;
