import z from "zod";
import { idParamsSchema } from "./types";

export const deleteCategoryParamsSchema = idParamsSchema;

export type DeleteCategoryParams = z.infer<typeof deleteCategoryParamsSchema>;

export const deleteCategoryResponseSchema = z.unknown();

export type DeleteCategoryResponse = z.infer<
  typeof deleteCategoryResponseSchema
>;
