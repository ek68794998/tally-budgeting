import z from "zod";
import { errorCodeSchema } from "../errorCodes/errorCodes";
import { sortDirectionSchema } from "../types";

export const apiErrorSchema = z.object({
	code: errorCodeSchema,
	params: z.record(z.string(), z.string()).optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

const apiResponseSchemaBase = z.object({
	error: apiErrorSchema.optional(),
	success: z.boolean(),
});

export const apiResponseSchema = apiResponseSchemaBase.catchall(z.unknown());

export type ApiResponse = z.infer<typeof apiResponseSchema>;

export const createApiResponseSchema = <TData extends z.ZodRawShape>(
	dataSchema: TData,
) => apiResponseSchemaBase.extend(dataSchema);

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
