import z from "zod";
import { createApiResponseSchema } from "./types";

export const databaseRestoreMaximumBytes = 512 * 1024 * 1024;

export const postDatabaseRestoreRequestSchema = z.object({
	confirm: z.literal("restore"),
	file: z.file().max(databaseRestoreMaximumBytes),
});

export type PostDatabaseRestoreRequest = z.infer<
	typeof postDatabaseRestoreRequestSchema
>;

export const postDatabaseRestoreResponseSchema = createApiResponseSchema({});

export type PostDatabaseRestoreResponse = z.infer<
	typeof postDatabaseRestoreResponseSchema
>;
