import z from "zod";

export const deleteTransactionRuleParamsSchema = z.object({
	id: z.string(),
});

export type DeleteTransactionRuleParams = z.infer<
	typeof deleteTransactionRuleParamsSchema
>;

export const deleteTransactionRuleResponseSchema = z.unknown();

export type DeleteTransactionRuleResponse = z.infer<
	typeof deleteTransactionRuleResponseSchema
>;
