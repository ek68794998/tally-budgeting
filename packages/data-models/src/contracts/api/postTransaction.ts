import z from "zod";
import { transactionFieldsSchema } from "../transaction";
import { createApiResponseSchema } from "./types";

export const postTransactionRequestSchema = z.object({
	transaction: transactionFieldsSchema,
});

export type PostTransactionRequest = z.infer<
	typeof postTransactionRequestSchema
>;

export const postTransactionResponseSchema = createApiResponseSchema({});

export type PostTransactionResponse = z.infer<
	typeof postTransactionResponseSchema
>;
