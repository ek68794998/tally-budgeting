import { toError } from "@ekumlin/typescript-toolkit/error";
import {
	Forbidden,
	type HttpStatusCode,
	InternalServerError,
	isSuccessHttpStatusCode,
	NoContent,
	ServiceUnavailable,
	TooManyRequests,
	Unauthorized,
} from "@ekumlin/typescript-toolkit/http";
import {
	type ApiError,
	type ApiResponse,
} from "@tally/data-models/contracts/api/types";
import { StructuredError } from "@tally/data-models/error/structuredError";
import { type NextRequest, NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { SessionCookieName } from "../../auth/cookie";
import { isAuthenticatedAsync } from "../../auth/verifyRequest";
import { isDatabaseUnavailableError } from "../../storage/databaseErrors";
import { telemetry } from "../../telemetry/telemetry";
import { enforceRateLimitAsync, getIpAddress } from "../helpers";
import { type NextResponseFn } from "../types";
import { HttpError } from "./httpError";
import { parseRequestAsync } from "./parseRequest";
import { type ApiHandler, type ApiResult, type RequestSchemata } from "./types";

const safeMethods = new Set(["GET", "HEAD"]);

const globalRateLimiter = new RateLimiterMemory({
	duration: 10,
	points: 300,
});

export type ApiAccess = "authenticated" | "public";

interface ApiHandlerDefinition<
	TBody,
	TQuery,
	TParams,
	TResponse extends ApiResponse,
> {
	access?: ApiAccess;
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
	const {
		access = "authenticated",
		bodyParser,
		handler,
		schemata,
	} = definition;

	try {
		const guardResult = await guardRequestAsync(request, access);

		if (guardResult) {
			return guardResult;
		}

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

		telemetry().error("API_HANDLER_ERROR", {
			error,
			errorMessage: toError(error).message,
		});

		if (isDatabaseUnavailableError(error)) {
			apiError = {
				code: "databaseUnavailable",
				params: {},
				type: "DatabaseUnavailableError",
			};
			statusCode = ServiceUnavailable;
		} else if (error instanceof HttpError) {
			apiError = {
				code: error.code,
				params: error.params,
				type: "HttpError",
			};
			statusCode = error.status;
		} else if (error instanceof StructuredError) {
			apiError = {
				code: error.code,
				params: error.params,
				type: "StructuredError",
			};
			statusCode = InternalServerError;
		} else {
			apiError = {
				code: "http500",
				params: {},
				type: typeof error,
			};
			statusCode = InternalServerError;
		}

		return {
			error: apiError,
			statusCode,
		};
	}
};

const isCrossOriginRequest = (request: NextRequest): boolean => {
	const origin = request.headers.get("origin");

	if (safeMethods.has(request.method) || !origin) {
		return false;
	}

	const expectedHost =
		request.headers.get("x-forwarded-host") ?? request.headers.get("host");

	try {
		return new URL(origin).host !== expectedHost;
	} catch {
		return true;
	}
};

const guardRequestAsync = async (
	request: NextRequest,
	access: ApiAccess,
): Promise<ApiResult<never> | undefined> => {
	if (isCrossOriginRequest(request)) {
		return {
			error: { code: "http403", params: {} },
			statusCode: Forbidden,
		};
	}

	const ip = getIpAddress(request) ?? "(UNKNOWN)";
	const rateLimiterResult = await enforceRateLimitAsync(
		globalRateLimiter,
		ip,
		1,
	);

	if (rateLimiterResult.shouldThrottle) {
		return {
			error: { code: "http429", params: {} },
			statusCode: TooManyRequests,
		};
	}

	const isAuthenticated =
		access === "public" ||
		(await isAuthenticatedAsync(
			request.cookies.get(SessionCookieName)?.value,
		));

	if (!isAuthenticated) {
		return {
			error: { code: "http401", params: {} },
			statusCode: Unauthorized,
		};
	}

	return undefined;
};
