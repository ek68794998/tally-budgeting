import z from "zod";
import { subcategorySchema } from "../subcategory";
import { createApiResponseSchema } from "./types";

export const postSubcategoryRequestSchema = z.object({
	subcategory: subcategorySchema,
});

export type PostSubcategoryRequest = z.infer<
	typeof postSubcategoryRequestSchema
>;

export const postSubcategoryResponseSchema = createApiResponseSchema({});

export type PostSubcategoryResponse = z.infer<
	typeof postSubcategoryResponseSchema
>;
