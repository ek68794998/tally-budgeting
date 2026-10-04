import z from "zod";
import { subcategoryFieldsSchema } from "../subcategory";
import { createApiResponseSchema } from "./types";

export const postSubcategoryRequestSchema = z.object({
  subcategory: subcategoryFieldsSchema,
});

export type PostSubcategoryRequest = z.infer<
  typeof postSubcategoryRequestSchema
>;

export const postSubcategoryResponseSchema = createApiResponseSchema({});

export type PostSubcategoryResponse = z.infer<
  typeof postSubcategoryResponseSchema
>;
