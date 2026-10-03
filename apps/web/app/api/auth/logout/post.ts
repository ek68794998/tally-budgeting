import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { cookies } from "next/headers";
import z from "zod";
import { SessionCookieName } from "../../../auth/cookie";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type ApiResult } from "../../handlers/types";
import { type NextResponseFn } from "../../types";

export const PostLogoutRouteAsync: NextResponseFn = createApiHandler({
	access: "public",
	eventName: "POST:AUTH:LOGOUT",
	handler: async (): Promise<ApiResult<never>> => {
		const cookieStore = await cookies();
		cookieStore.delete(SessionCookieName);

		return { statusCode: NoContent };
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: z.unknown(),
	},
});
