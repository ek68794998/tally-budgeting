import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";
import { countRowSchema } from "@tally/data-models/database/countRow";
import { type ReferenceExpression, type SelectQueryBuilder } from "kysely";
import z from "zod";

export interface PaginatedResult<T> {
	data: T[];
	totalCount: number;
}

export interface CollectionParams {
	direction?: "ascending" | "descending";
	filter?: string;
	limit?: number;
	page?: number;
	sortBy?: string;
}

export interface GetRowsOptions {
	collectionParams?: CollectionParams;
}

const hasIdSchema = z.object({
	id: z.number().positive().or(z.number().negative()),
});

export const applyPagination = <DB, TB extends keyof DB & string, O>(
	query: SelectQueryBuilder<DB, TB, O>,
	page: number,
	limit: number,
): SelectQueryBuilder<DB, TB, O> => {
	const offset = calculateOffset(page, limit);
	return query.limit(limit).offset(offset);
};

export const buildLikePattern = (value: unknown): string =>
	`%${String(value)}%`;

export const getOrderDirection = (
	direction: "ascending" | "descending",
): "asc" | "desc" => (direction === "ascending" ? "asc" : "desc");

export const getQueryCountAsync = async <DB, TB extends keyof DB & string>(
	query: SelectQueryBuilder<DB, TB, unknown>,
	countColumn: ReferenceExpression<DB, TB>,
): Promise<number> => {
	const result = await query
		.select(({ fn }) => [fn.count<number>(countColumn).as("count")])
		.executeTakeFirstOrThrow();

	return countRowSchema.parse(result).count;
};

export const hasId = (value: unknown): value is { id: number } =>
	hasIdSchema.safeParse(value).success;

export const parseInValues = (
	value: unknown,
	converter: (val: string) => string | number | null | undefined = (v) => v,
): (string | number)[] =>
	String(value)
		.split(",")
		.map(converter)
		.filter((v) => !isNullOrUndefined(v));

export const rowOrRowsAsRows = <T>(values: T | T[]): T[] =>
	Array.isArray(values) ? values : [values];

export const withoutId = <T extends { id: unknown }>(
	item: T,
): Omit<T, "id"> => {
	const { id: _, ...rest } = item;
	return rest;
};

const calculateOffset = (page: number, limit: number): number =>
	(page - 1) * limit;
