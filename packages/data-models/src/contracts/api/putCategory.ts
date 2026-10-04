import z from "zod";
import { categoryFieldsSchema } from "../category";
import { createApiResponseSchema, idParamsSchema } from "./types";

export const putCategoryParamsSchema = idParamsSchema;

export type PutCategoryParams = z.infer<typeof putCategoryParamsSchema>;

export const putCategoryRequestSchema = z.object({
  category: categoryFieldsSchema,
});

export type PutCategoryRequest = z.infer<typeof putCategoryRequestSchema>;

export const putCategoryResponseSchema = createApiResponseSchema({});

export type PutCategoryResponse = z.infer<typeof putCategoryResponseSchema>;
