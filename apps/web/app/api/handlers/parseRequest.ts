import { BadRequest } from "@ekumlin/typescript-toolkit/http";
import { searchParamsToObject } from "@tally/utilities/object/searchParamsToObject";
import { type NextRequest } from "next/server";
import { type RequestParseResult, type RequestSchemata } from "./types";

export const parseRequestAsync = async <TBody, TQuery, TParams>(
	req: NextRequest,
	routeParams: unknown,
	schemata: RequestSchemata<TBody, TQuery, TParams>,
): Promise<RequestParseResult<TBody, TQuery, TParams>> => {
	try {
		const body: unknown = await req.json().catch(() => ({}));
		const parsedBody = schemata.body.safeParse(body);

		if (!parsedBody.success) {
			return {
				error: `Invalid request body: ${parsedBody.error.message /* TODO */}`,
				statusCode: BadRequest,
				success: false,
			};
		}

		const url = new URL(req.url);
		const searchParams = searchParamsToObject(url.searchParams);
		const parsedQuery = schemata.query.safeParse(searchParams);

		if (!parsedQuery.success) {
			return {
				error: `Invalid query parameters: ${parsedQuery.error.message /* TODO */}`,
				statusCode: BadRequest,
				success: false,
			};
		}

		const parsedParams = schemata.params.safeParse(routeParams);

		if (!parsedParams.success) {
			return {
				error: `Invalid route parameters: ${parsedParams.error.message /* TODO */}`,
				statusCode: BadRequest,
				success: false,
			};
		}

		return {
			body: parsedBody.data,
			params: parsedParams.data,
			query: parsedQuery.data,
			success: true,
		};
	} catch (error) {
		console.error(error); /* TODO */

		return {
			error: "Failed to parse request",
			statusCode: BadRequest,
			success: false,
		};
	}
};
