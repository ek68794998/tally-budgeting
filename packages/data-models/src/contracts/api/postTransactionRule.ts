import z from "zod";
import { transactionRuleSchema } from "../transactionRule";
import { createApiResponseSchema } from "./types";

export const postTransactionRuleRequestSchema = z.object({
	rule: transactionRuleSchema,
});

export type PostTransactionRuleRequest = z.infer<
	typeof postTransactionRuleRequestSchema
>;

export const postTransactionRuleResponseSchema = createApiResponseSchema({});

export type PostTransactionRuleResponse = z.infer<
	typeof postTransactionRuleResponseSchema
>;
