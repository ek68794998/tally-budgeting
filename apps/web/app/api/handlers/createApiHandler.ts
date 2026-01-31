import {
	type HttpStatusCode,
	InternalServerError,
	isSuccessHttpStatusCode,
} from "@ekumlin/typescript-toolkit/http";
import {
	type ApiError,
	type ApiResponse,
} from "@tally/data-models/contracts/api/types";
import { StructuredError } from "@tally/data-models/error/structuredError";
import { type NextRequest, NextResponse } from "next/server";
import { type NextResponseFn } from "../types";
import { HttpError } from "./httpError";
import { parseRequestAsync } from "./parseRequest";
import { type ApiHandler, type ApiResult, type RequestSchemata } from "./types";

interface ApiHandlerDefinition<
	TBody,
	TQuery,
	TParams,
	TResponse extends ApiResponse,
> {
	eventName: string;
	handler: ApiHandler<TBody, TQuery, TParams, TResponse>;
	schemata: RequestSchemata<TBody, TQuery, TParams>;
}

export const createApiHandler =
	<TBody, TQuery, TParams, TResponse extends ApiResponse>(
		definition: ApiHandlerDefinition<TBody, TQuery, TParams, TResponse>,
	): NextResponseFn =>
	async (request, { params }): Promise<NextResponse> => {
		const { eventName } = definition;

		const startTime = Date.now();
		const routeParams = await params;

		const { data, error, statusCode } = await executeHandlerAsync(
			definition,
			request,
			routeParams,
		);

		const duration = Date.now() - startTime;

		logRequest(
			eventName,
			request.method,
			request.nextUrl.pathname,
			statusCode,
			duration,
			error,
		);

		const response: ApiResponse = {
			...data,
			error,
			success: isSuccessHttpStatusCode(statusCode),
		};

		return NextResponse.json(response, { status: statusCode });
	};

const executeHandlerAsync = async <
	TBody,
	TQuery,
	TParams,
	TResponse extends ApiResponse,
>(
	definition: ApiHandlerDefinition<TBody, TQuery, TParams, TResponse>,
	request: NextRequest,
	routeParams: unknown,
): Promise<ApiResult<TResponse>> => {
	const { handler, schemata } = definition;

	try {
		const parseResult = await parseRequestAsync(
			request,
			routeParams,
			schemata,
		);

		if (!parseResult.success) {
			return {
				error: parseResult.error,
				statusCode: parseResult.statusCode,
			};
		}

		return await handler(parseResult, request);
	} catch (error) {
		let apiError: ApiError;
		let statusCode: HttpStatusCode;

		// TODO (#2) Consolidate this logging.
		console.error(error);

		if (error instanceof HttpError) {
			apiError = {
				code: error.code,
				params: error.params,
			};
			statusCode = error.status;
		} else if (error instanceof StructuredError) {
			apiError = {
				code: error.code,
				params: error.params,
			};
			statusCode = InternalServerError;
		} else {
			apiError = {
				code: "http500",
				params: {},
			};
			statusCode = InternalServerError;
		}

		return {
			error: apiError,
			statusCode,
		};
	}
};

const logRequest = (
	eventName: string,
	method: string,
	path: string,
	statusCode: number,
	duration: number,
	error: ApiError | undefined,
) => {
	const text = `${new Date().toISOString()} [${eventName}] ${method} ${path} returned ${statusCode} after ${duration}ms`;

	if (error) {
		// TODO (#2) Consolidate this logging.
		console.error(text);
		console.error(error);
		return;
	}

	// TODO (#2) Integrate with telemetry service
	// eslint-disable-next-line no-console
	console.log(text);
};
