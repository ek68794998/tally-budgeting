import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";
import { countRowSchema } from "@tally/data-models/database/countRow";
import { type ReferenceExpression, type SelectQueryBuilder, sql } from "kysely";

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

// node-pg serializes JS arrays as Postgres array literals, so every jsonb write must go through here.
export const toJsonb = (value: unknown) =>
	sql<never>`${JSON.stringify(value)}::jsonb`;

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

const calculateOffset = (page: number, limit: number): number =>
	(page - 1) * limit;
