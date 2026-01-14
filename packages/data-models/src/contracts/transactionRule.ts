import z from "zod";

export const transactionRuleSchema = z.object({
	active: z.boolean(),
	id: z.int(),
	matcher: z.object({
		flags: z.string(),
		pattern: z.string().min(1).max(100),
	}),
	merchantName: z.string(),
	priority: z.int(),
	subcategoryId: z.int(),
});

export type TransactionRule = z.infer<typeof transactionRuleSchema>;
