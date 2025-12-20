import type z from "zod";
import { categorySchema } from "../contracts/category";

export const categoryRowSchema = categorySchema.clone(); // No difference w/ database.

export type CategoryRow = z.infer<typeof categoryRowSchema>;
