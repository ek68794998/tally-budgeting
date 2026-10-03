import { SessionTtlSeconds } from "./session";

export const SessionCookieName = "tally_session";

export interface SessionCookieOptions {
	httpOnly: true;
	maxAge: number;
	path: "/";
	sameSite: "lax";
	secure: boolean;
}

export const getSessionCookieOptions = (
	request: Pick<Request, "headers" | "url">,
): SessionCookieOptions => {
	const forwardedProto = request.headers
		.get("x-forwarded-proto")
		?.split(",")[0]
		?.trim();
	const isHttps =
		forwardedProto === "https" ||
		(!forwardedProto && new URL(request.url).protocol === "https:");

	return {
		httpOnly: true,
		maxAge: SessionTtlSeconds,
		path: "/",
		sameSite: "lax",
		secure: isHttps,
	};
};
