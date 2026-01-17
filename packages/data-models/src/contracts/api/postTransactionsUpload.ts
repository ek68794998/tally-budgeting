import z from "zod";
import { transactionSchema } from "../transaction";
import { createApiResponseSchema } from "./types";

export const postTransactionsUploadResponseSchema = createApiResponseSchema({
	rowsFailed: z.array(z.tuple([z.string(), z.unknown()])),
	rowsIgnored: z.array(z.unknown()),
	rowsProcessed: z.array(transactionSchema),
});

export type PostTransactionsUploadResponse = z.infer<
	typeof postTransactionsUploadResponseSchema
>;
