import z from "zod";
import { categoryFieldsSchema } from "../category";
import { createApiResponseSchema } from "./types";

export const postCategoryRequestSchema = z.object({
  category: categoryFieldsSchema,
});

export type PostCategoryRequest = z.infer<typeof postCategoryRequestSchema>;

export const postCategoryResponseSchema = createApiResponseSchema({});

export type PostCategoryResponse = z.infer<typeof postCategoryResponseSchema>;
