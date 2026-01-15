import { type HttpStatusCode } from "@ekumlin/typescript-toolkit/http";
import { type NextRequest } from "next/server";
import { type z } from "zod";
import { type NextResponseFn } from "../types";

export type ApiHandler<TBody, TQuery, TParams, TResponse> = (
	input: RequestParseSuccessResult<TBody, TQuery, TParams>,
	request: NextRequest,
) => Promise<ApiResult<TResponse>>;

export type ApiResult<T> =
	| { data: T; ok: true }
	| { error: string; ok: false; statusCode: HttpStatusCode };

export interface RequestParseErrorResult {
	error: string;
	statusCode: HttpStatusCode;
	success: false;
}

export interface RequestParseSuccessResult<TBody, TQuery, TParams> {
	body: TBody;
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
