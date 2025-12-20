import z from "zod";

export const transactionRuleSchema = z.object({
	id: z.number(),
	isActive: z.boolean(),
	matcher: z.object({
		flags: z.string(),
		pattern: z.string(),
	}),
	merchantName: z.string(),
	priority: z.number(),
	subcategoryId: z.number(),
});

export type TransactionRule = z.infer<typeof transactionRuleSchema>;
