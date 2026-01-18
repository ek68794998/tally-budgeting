import z from "zod";
import { categorySchema } from "../category";
import { createApiResponseSchema } from "./types";

export const postCategoryRequestSchema = z.object({
	category: categorySchema,
});

export type PostCategoryRequest = z.infer<typeof postCategoryRequestSchema>;

export const postCategoryResponseSchema = createApiResponseSchema({});

export type PostCategoryResponse = z.infer<typeof postCategoryResponseSchema>;
