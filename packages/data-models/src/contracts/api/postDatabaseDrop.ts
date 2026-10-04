import z from "zod";
import { createApiResponseSchema } from "./types";

export const postDatabaseDropRequestSchema = z.object({
	confirm: z.literal("delete"),
});

export type PostDatabaseDropRequest = z.infer<
	typeof postDatabaseDropRequestSchema
>;

export const postDatabaseDropResponseSchema = createApiResponseSchema({});

export type PostDatabaseDropResponse = z.infer<
	typeof postDatabaseDropResponseSchema
>;
