import z from "zod";
import { sortDirectionSchema } from "../types";

export const createFilterParamsSchema = () =>
	z.object({
		filter: z.string().default(""),
	});

export const createPaginationParamsSchema = (maximumPerPage: number) =>
	z.object({
		limit: z
			.string()
			.min(1)
			.max(maximumPerPage)
			.transform(Number)
			.default(maximumPerPage),
		page: z.string().min(1).transform(Number).default(1),
	});

export const createSortParamsSchema = (fieldNames: string[]) =>
	z.object({
		direction: sortDirectionSchema.optional(),
		sortBy: z.enum(fieldNames).optional(),
	});
