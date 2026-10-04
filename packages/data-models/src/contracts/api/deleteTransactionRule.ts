import z from "zod";
import { idParamsSchema } from "./types";

export const deleteTransactionRuleParamsSchema = idParamsSchema;

export type DeleteTransactionRuleParams = z.infer<
  typeof deleteTransactionRuleParamsSchema
>;

export const deleteTransactionRuleResponseSchema = z.unknown();

export type DeleteTransactionRuleResponse = z.infer<
  typeof deleteTransactionRuleResponseSchema
>;
