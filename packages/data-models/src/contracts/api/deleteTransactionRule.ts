import z from "zod";

export const deleteTransactionRuleQuerySchema = z.object({
	id: z.string(),
});

export type DeleteTransactionRuleQuery = z.infer<
	typeof deleteTransactionRuleQuerySchema
>;
