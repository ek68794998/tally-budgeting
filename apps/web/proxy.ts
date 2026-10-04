import { ServiceUnavailable } from "@ekumlin/typescript-toolkit/http";
import { type NextRequest, NextResponse } from "next/server";
import { getAuthConfig } from "./app/auth/config";
import { getSessionCookieOptions, SessionCookieName } from "./app/auth/cookie";
import {
	createSessionToken,
	type VerifySessionTokenResult,
} from "./app/auth/session";
import { getSessionStatusAsync } from "./app/auth/verifyRequest";
import { getOrCreateSessionSecretAsync } from "./app/storage/appSettingsClient";
import { isDatabaseUnavailableError } from "./app/storage/databaseErrors";

const loginPath = "/login";
const databaseUnavailableMessage =
	"The database is unavailable. Check that it is running, then reload this page.";

const getSessionStatusOrUnavailableAsync = async (
	request: NextRequest,
): Promise<VerifySessionTokenResult | "unavailable"> => {
	try {
		return await getSessionStatusAsync(
			request.cookies.get(SessionCookieName)?.value,
		);
	} catch (error) {
		if (isDatabaseUnavailableError(error)) {
			return "unavailable";
		}

		throw error;
	}
};

const proxyAsync = async (request: NextRequest): Promise<NextResponse> => {
	const sessionStatus = await getSessionStatusOrUnavailableAsync(request);

	if (sessionStatus === "unavailable") {
		return new NextResponse(databaseUnavailableMessage, {
			status: ServiceUnavailable,
		});
	}

	const { shouldRefresh, valid } = sessionStatus;

	if (!valid) {
		const loginUrl = new URL(loginPath, request.url);
		loginUrl.searchParams.set(
			"next",
			`${request.nextUrl.pathname}${request.nextUrl.search}`,
		);

		return NextResponse.redirect(loginUrl);
	}

	const response = NextResponse.next();
	const authConfig = getAuthConfig();

	if (shouldRefresh && authConfig.mode === "password") {
		const secret = await getOrCreateSessionSecretAsync();
		const token = createSessionToken({
			now: new Date(),
			password: authConfig.password,
			secret,
		});

		response.cookies.set(
			SessionCookieName,
			token,
			getSessionCookieOptions(request),
		);
	}

	return response;
};

export const config = {
	matcher: ["/((?!api|login|_next/static|_next/image|favicon.ico).*)"],
};

export { proxyAsync as proxy };
