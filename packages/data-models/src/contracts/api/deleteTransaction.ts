import z from "zod";
import { idParamsSchema } from "./types";

export const deleteTransactionParamsSchema = idParamsSchema;

export type DeleteTransactionParams = z.infer<
  typeof deleteTransactionParamsSchema
>;

export const deleteTransactionResponseSchema = z.unknown();

export type DeleteTransactionResponse = z.infer<
  typeof deleteTransactionResponseSchema
>;
