import { type SortDirection } from "@tally/data-models/contracts/types";
import { type Generated } from "kysely";

export interface CollectionParams {
	direction?: SortDirection;
	filter?: string;
	limit: number;
	page: number;
	sortBy?: string;
}

export interface GetAllQueryResult<T> {
	data: T[];
	totalCount: number;
}

export interface GetRowsOptions {
	collectionParams: CollectionParams;
}

export type WithGeneratedId<T, K extends keyof T> = Omit<T, K> & {
	[P in K]: Generated<T[P]>;
};
