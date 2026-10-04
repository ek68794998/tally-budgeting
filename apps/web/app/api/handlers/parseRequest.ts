import { toError } from "@ekumlin/typescript-toolkit/error";
import { BadRequest } from "@ekumlin/typescript-toolkit/http";
import { searchParamsToObject } from "@tally/utilities/object/searchParamsToObject";
import { type NextRequest } from "next/server";
import { telemetry } from "../../telemetry/telemetry";
import { getIpAddress } from "../helpers";
import { type RequestParseResult, type RequestSchemata } from "./types";

export const parseRequestAsync = async <TBody, TQuery, TParams>(
  req: NextRequest,
  parser: ((request: NextRequest) => Promise<unknown>) | undefined,
  routeParams: unknown,
  schemata: RequestSchemata<TBody, TQuery, TParams>,
): Promise<RequestParseResult<TBody, TQuery, TParams>> => {
  const ip = getIpAddress(req) ?? "(UNKNOWN)";

  try {
    const body: unknown = await (parser ? parser(req) : req.json()).catch(
      () => ({}),
    );
    const parsedBody = schemata.body.safeParse(body);

    if (!parsedBody.success) {
      telemetry().error("API_REQUEST_INVALID", {
        errorMessage: parsedBody.error.message,
        ip,
      });

      return {
        error: {
          code: "invalidRequestBody",
          params: {},
        },
        ip,
        statusCode: BadRequest,
        success: false,
      };
    }

    const url = new URL(req.url);
    const searchParams = searchParamsToObject(url.searchParams);
    const parsedQuery = schemata.query.safeParse(searchParams);

    if (!parsedQuery.success) {
      telemetry().error("API_REQUEST_INVALID", {
        errorMessage: parsedQuery.error.message,
        ip,
      });

      return {
        error: {
          code: "invalidQueryParameters",
          params: {},
        },
        ip,
        statusCode: BadRequest,
        success: false,
      };
    }

    const parsedParams = schemata.params.safeParse(routeParams);

    if (!parsedParams.success) {
      telemetry().error("API_REQUEST_INVALID", {
        errorMessage: parsedParams.error.message,
        ip,
      });

      return {
        error: {
          code: "invalidRouteParameters",
          params: {},
        },
        ip,
        statusCode: BadRequest,
        success: false,
      };
    }

    return {
      body: parsedBody.data,
      ip,
      params: parsedParams.data,
      query: parsedQuery.data,
      success: true,
    };
  } catch (error) {
    telemetry().error("API_REQUEST_PARSE_FAILED", {
      error,
      errorMessage: toError(error).message,
    });

    return {
      error: {
        code: "invalidRequestShape",
        params: {},
      },
      ip,
      statusCode: BadRequest,
      success: false,
    };
  }
};
