import z from "zod";
import { transactionRuleSchema } from "../transactionRule";
import { createApiResponseSchema } from "./types";

export const getTransactionRulesResponseSchema = createApiResponseSchema({
	transactionRules: z.array(transactionRuleSchema),
});

export type GetTransactionRulesResponse = z.infer<
	typeof getTransactionRulesResponseSchema
>;
