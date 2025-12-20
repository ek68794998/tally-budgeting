import { type SortDirection } from "@tally/data-models/contracts/types";

export interface GetRowsOptions {
	collectionParams: CollectionParams;
}

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
