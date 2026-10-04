import z from "zod";
import { transactionFieldsSchema } from "../transaction";
import { createApiResponseSchema, idParamsSchema } from "./types";

export const putTransactionParamsSchema = idParamsSchema;

export type PutTransactionParams = z.infer<typeof putTransactionParamsSchema>;

export const putTransactionRequestSchema = z.object({
	transaction: transactionFieldsSchema,
});

export type PutTransactionRequest = z.infer<typeof putTransactionRequestSchema>;

export const putTransactionResponseSchema = createApiResponseSchema({});

export type PutTransactionResponse = z.infer<
	typeof putTransactionResponseSchema
>;
