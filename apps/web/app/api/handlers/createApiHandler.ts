import {
	type HttpStatusCode,
	InternalServerError,
	isSuccessHttpStatusCode,
	NoContent,
} from "@ekumlin/typescript-toolkit/http";
import {
	type ApiError,
	type ApiResponse,
} from "@tally/data-models/contracts/api/types";
import { StructuredError } from "@tally/data-models/error/structuredError";
import { type NextRequest, NextResponse } from "next/server";
import { telemetry } from "../../telemetry/telemetry";
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
	bodyParser?: (request: NextRequest) => Promise<TBody>;
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

		const { end: endProfiling } = telemetry().httpIncoming(eventName, {
			method: request.method,
			path: request.nextUrl.pathname,
		});

		const routeParams = await params;

		const { data, error, statusCode } = await executeHandlerAsync(
			definition,
			request,
			routeParams,
		);

		const response: ApiResponse = {
			...data,
			error,
			success: isSuccessHttpStatusCode(statusCode),
		};

		endProfiling({
			error,
			method: request.method,
			path: request.nextUrl.pathname,
			statusCode,
		});

		if (statusCode === NoContent) {
			// https://github.com/vercel/next.js/discussions/51118
			return new NextResponse(null, { status: statusCode });
		}

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
	const { bodyParser, handler, schemata } = definition;

	try {
		const parseResult = await parseRequestAsync(
			request,
			bodyParser,
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

		telemetry().error("API_HANDLER_ERROR", { error });

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
