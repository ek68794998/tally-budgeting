import z from "zod";
import { subcategoryFieldsSchema } from "../subcategory";
import { createApiResponseSchema, idParamsSchema } from "./types";

export const putSubcategoryParamsSchema = idParamsSchema;

export type PutSubcategoryParams = z.infer<typeof putSubcategoryParamsSchema>;

export const putSubcategoryRequestSchema = z.object({
	subcategory: subcategoryFieldsSchema,
});

export type PutSubcategoryRequest = z.infer<typeof putSubcategoryRequestSchema>;

export const putSubcategoryResponseSchema = createApiResponseSchema({});

export type PutSubcategoryResponse = z.infer<
	typeof putSubcategoryResponseSchema
>;
