import z from "zod";
import { transactionRuleSchema } from "../transactionRule";

export const getTransactionRulesResponseSchema = z.object({
	transactionRules: z.array(transactionRuleSchema),
});

export type GetTransactionRulesResponse = z.infer<
	typeof getTransactionRulesResponseSchema
>;
