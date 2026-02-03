import z from "zod";
import { transactionSchema } from "../transaction";
import { createApiResponseSchema } from "./types";

export const postTransactionsUploadRequestSchema = z.object({
	accountId: z.string().regex(/[0-9]+/),
	file: z.file(),
	isValidationOnly: z.enum(["true", "false"]),
});

export type PostTransactionsUploadRequest = z.infer<
	typeof postTransactionsUploadRequestSchema
>;

export const postTransactionsUploadResponseSchema = createApiResponseSchema({
	rowsFailed: z.array(z.tuple([z.string(), z.unknown()])),
	rowsIgnored: z.array(z.unknown()),
	rowsProcessed: z.array(transactionSchema),
});

export type PostTransactionsUploadResponse = z.infer<
	typeof postTransactionsUploadResponseSchema
>;
