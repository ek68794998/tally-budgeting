import z from "zod";
import { transactionRuleFieldsSchema } from "../transactionRule";
import { createApiResponseSchema, idParamsSchema } from "./types";

export const putTransactionRuleParamsSchema = idParamsSchema;

export type PutTransactionRuleParams = z.infer<
  typeof putTransactionRuleParamsSchema
>;

export const putTransactionRuleRequestSchema = z.object({
  rule: transactionRuleFieldsSchema,
});

export type PutTransactionRuleRequest = z.infer<
  typeof putTransactionRuleRequestSchema
>;

export const putTransactionRuleResponseSchema = createApiResponseSchema({});

export type PutTransactionRuleResponse = z.infer<
  typeof putTransactionRuleResponseSchema
>;
