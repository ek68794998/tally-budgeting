import { InternalServerError, Ok } from "@ekumlin/typescript-toolkit/http";
import { NextResponse } from "next/server";
import { type NextResponseFn } from "../types";
import { HttpError } from "./httpError";
import { parseRequestAsync } from "./parseRequest";
import { type ApiHandler, type RequestSchemata } from "./types";

interface ApiHandlerDefinition<TBody, TQuery, TParams, TResponse> {
	eventName: string;
	handler: ApiHandler<TBody, TQuery, TParams, TResponse>;
	schemata: RequestSchemata<TBody, TQuery, TParams>;
}

export const createApiHandler =
	<TBody, TQuery, TParams, TResponse>(
		definition: ApiHandlerDefinition<TBody, TQuery, TParams, TResponse>,
	): NextResponseFn =>
	async (request, { params }): Promise<NextResponse> => {
		const { eventName, handler, schemata } = definition;

		const startTime = Date.now();
		const routeParams = await params;

		const getDuration = () => Date.now() - startTime;

		try {
			const parseResult = await parseRequestAsync(
				request,
				routeParams,
				schemata,
			);

			if (!parseResult.success) {
				logRequest(
					eventName,
					request.method,
					request.nextUrl.pathname,
					parseResult.statusCode,
					getDuration(),
					parseResult.error,
				);

				return NextResponse.json(
					{ error: parseResult.error },
					{ status: parseResult.statusCode },
				);
			}

			const result = await handler(parseResult, request);
			const duration = getDuration();

			if (!result.ok) {
				logRequest(
					eventName,
					request.method,
					request.nextUrl.pathname,
					result.statusCode,
					duration,
					result.error,
				);
				return NextResponse.json(
					{ error: result.error },
					{ status: result.statusCode },
				);
			}

			logRequest(
				eventName,
				request.method,
				request.nextUrl.pathname,
				Ok,
				duration,
			);

			return NextResponse.json(result.data);
		} catch (error) {
			const userFacingErrorMessage = "Internal server error"; // TODO

			console.error(error);

			const errorMessage =
				error instanceof Error ? error.message : userFacingErrorMessage;
			const status =
				error instanceof HttpError ? error.status : InternalServerError;

			logRequest(
				eventName,
				request.method,
				request.nextUrl.pathname,
				status,
				getDuration(),
				errorMessage,
			);

			return NextResponse.json(
				{ error: userFacingErrorMessage },
				{ status },
			);
		}
	};

const logRequest = (
	eventName: string,
	method: string,
	path: string,
	statusCode: number,
	duration: number,
	error?: string,
) => {
	// TODO: Integrate with telemetry service
	// eslint-disable-next-line no-console
	console.log({
		duration,
		error,
		eventName,
		method,
		path,
		statusCode,
		timestamp: new Date().toISOString(),
	});
};
