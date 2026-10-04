import { NoContent } from "@ekumlin/typescript-toolkit/http";
import z from "zod";
import { pingDatabaseAsync } from "../../storage/healthClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type ApiResult } from "../handlers/types";
import { type NextResponseFn } from "../types";

export const GetHealthRouteAsync: NextResponseFn = createApiHandler({
	access: "public",
	eventName: "GET:HEALTH",
	handler: async (): Promise<ApiResult<never>> => {
		await pingDatabaseAsync();

		return { statusCode: NoContent };
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: z.unknown(),
	},
});
