import z from "zod";
import { transactionRuleSchema } from "../transactionRule";

export const postTransactionRuleRequestSchema = z.object({
	rule: transactionRuleSchema,
});

export type PostTransactionRuleRequest = z.infer<
	typeof postTransactionRuleRequestSchema
>;

export const postTransactionRuleResponseSchema = z.object({
	success: z.boolean(),
});

export type PostTransactionRuleResponse = z.infer<
	typeof postTransactionRuleResponseSchema
>;
