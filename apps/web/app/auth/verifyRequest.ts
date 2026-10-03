import { Unauthorized } from "@ekumlin/typescript-toolkit/http";
import { cookies } from "next/headers";
import { HttpError } from "../api/handlers/httpError";
import { getOrCreateSessionSecretAsync } from "../storage/appSettingsClient";
import { getAuthConfig } from "./config";
import { SessionCookieName } from "./cookie";
import { type VerifySessionTokenResult, verifySessionToken } from "./session";

export const getSessionStatusAsync = async (
	cookieValue: string | undefined,
): Promise<VerifySessionTokenResult> => {
	const config = getAuthConfig();

	if (config.mode === "disabled") {
		return { shouldRefresh: false, valid: true };
	}

	if (!cookieValue) {
		return { shouldRefresh: false, valid: false };
	}

	const secret = await getOrCreateSessionSecretAsync();

	return verifySessionToken(cookieValue, {
		now: new Date(),
		password: config.password,
		secret,
	});
};

export const isAuthenticatedAsync = async (
	cookieValue: string | undefined,
): Promise<boolean> => (await getSessionStatusAsync(cookieValue)).valid;

export const assertAuthenticatedAsync = async (): Promise<void> => {
	const cookieStore = await cookies();

	if (
		!(await isAuthenticatedAsync(cookieStore.get(SessionCookieName)?.value))
	) {
		throw new HttpError("Authentication required.", Unauthorized);
	}
};
