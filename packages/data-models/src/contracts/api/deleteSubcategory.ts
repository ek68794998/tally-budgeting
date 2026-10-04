import z from "zod";
import { idParamsSchema } from "./types";

export const deleteSubcategoryParamsSchema = idParamsSchema;

export type DeleteSubcategoryParams = z.infer<
  typeof deleteSubcategoryParamsSchema
>;

export const deleteSubcategoryResponseSchema = z.unknown();

export type DeleteSubcategoryResponse = z.infer<
  typeof deleteSubcategoryResponseSchema
>;
