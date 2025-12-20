import z from "zod";

export const transactionRuleRowSchema = z.object({
	flags: z.string(),
	id: z.number(),
	isActive: z.number().min(0).max(1),
	merchant: z.string(),
	pattern: z.string().min(1).max(100),
	priority: z.number(),
	subcategoryId: z.number(),
});

export type TransactionRuleRow = z.infer<typeof transactionRuleRowSchema>;
