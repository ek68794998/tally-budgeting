import { type HttpStatusCode } from "@ekumlin/typescript-toolkit/http";
import {
	type ApiError,
	type ApiResponse,
} from "@tally/data-models/contracts/api/types";
import { type NextRequest } from "next/server";
import { type z } from "zod";
import { type NextResponseFn } from "../types";

export type ApiHandler<
	TBody,
	TQuery,
	TParams,
	TResponse extends ApiResponse,
> = (
	input: RequestParseSuccessResult<TBody, TQuery, TParams>,
	request: NextRequest,
) => Promise<ApiResult<TResponse>>;

export interface ApiResult<T extends ApiResponse> {
	data?: Omit<T, "success">;
	error?: ApiError;
	/** Bypasses JSON serialization, e.g., to stream a file download. */
	rawResponse?: Response;
	statusCode: HttpStatusCode;
}

export interface RequestParseErrorResult {
	error: ApiError;
	ip: string | undefined;
	statusCode: HttpStatusCode;
	success: false;
}

export interface RequestParseSuccessResult<TBody, TQuery, TParams> {
	body: TBody;
	ip: string;
	params: TParams;
	query: TQuery;
	success: true;
}

export type RequestParseResult<TBody, TQuery, TParams> =
	| RequestParseErrorResult
	| RequestParseSuccessResult<TBody, TQuery, TParams>;

export interface RequestSchemata<TBody, TQuery, TParams> {
	body: z.ZodSchema<TBody>;
	params: z.ZodSchema<TParams>;
	query: z.ZodSchema<TQuery>;
}

export interface GetRouteDefinition<TResponse extends object> {
	eventName: string;
	handle: (
		...params: Parameters<NextResponseFn>
	) => Promise<RouteResult<TResponse>>;
}

export interface PostRouteDefinition<
	TBody extends object,
	TResponse extends object,
> extends GetRouteDefinition<TResponse> {
	bodySchema: z.ZodSchema<TBody>;
}

export interface RouteResult<TData extends object> {
	data: TData;
	status: HttpStatusCode;
}
