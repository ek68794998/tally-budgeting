import { createHmac, timingSafeEqual } from "node:crypto";
import { Duration } from "luxon";

export const SessionTtlSeconds = Duration.fromObject({ days: 30 }).as(
	"seconds",
);

const passwordVersionLength = 16;

interface SessionPayload {
	exp: number;
	iat: number;
	pv: string;
}

interface CreateSessionTokenOptions {
	now: Date;
	password: string;
	secret: string;
}

interface VerifySessionTokenOptions {
	now: Date;
	password: string;
	secret: string;
}

export interface VerifySessionTokenResult {
	shouldRefresh: boolean;
	valid: boolean;
}

const invalidResult: VerifySessionTokenResult = {
	shouldRefresh: false,
	valid: false,
};

const sign = (secret: string, value: string): Buffer =>
	createHmac("sha256", secret).update(value).digest();

// Derived rather than a bare password hash so the cookie can't be used to
// brute-force the password offline. Changing the password invalidates sessions.
const getPasswordVersion = (secret: string, password: string): string =>
	sign(secret, `pv:${password}`)
		.toString("base64url")
		.slice(0, passwordVersionLength);

export const createSessionToken = ({
	now,
	password,
	secret,
}: CreateSessionTokenOptions): string => {
	const iat = Math.floor(now.getTime() / 1000);
	const payload: SessionPayload = {
		exp: iat + SessionTtlSeconds,
		iat,
		pv: getPasswordVersion(secret, password),
	};
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
		"base64url",
	);

	return `${encodedPayload}.${sign(secret, encodedPayload).toString("base64url")}`;
};

const parsePayload = (encodedPayload: string): SessionPayload | undefined => {
	try {
		const parsed: unknown = JSON.parse(
			Buffer.from(encodedPayload, "base64url").toString("utf8"),
		);

		if (
			typeof parsed === "object" &&
			parsed !== null &&
			"exp" in parsed &&
			"iat" in parsed &&
			"pv" in parsed &&
			typeof parsed.exp === "number" &&
			typeof parsed.iat === "number" &&
			typeof parsed.pv === "string"
		) {
			return { exp: parsed.exp, iat: parsed.iat, pv: parsed.pv };
		}
	} catch {
		// Malformed payloads are treated as invalid sessions.
	}

	return undefined;
};

const areStringsEqual = (a: string, b: string): boolean => {
	const bufferA = Buffer.from(a);
	const bufferB = Buffer.from(b);

	return (
		bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB)
	);
};

export const verifySessionToken = (
	token: string | undefined,
	{ now, password, secret }: VerifySessionTokenOptions,
): VerifySessionTokenResult => {
	const [encodedPayload, signature, ...rest] = token?.split(".") ?? [];

	if (!encodedPayload || !signature || rest.length > 0) {
		return invalidResult;
	}

	const expectedSignature = sign(secret, encodedPayload).toString(
		"base64url",
	);

	if (!areStringsEqual(signature, expectedSignature)) {
		return invalidResult;
	}

	const payload = parsePayload(encodedPayload);
	const nowSeconds = Math.floor(now.getTime() / 1000);

	if (
		!payload ||
		payload.exp <= nowSeconds ||
		!areStringsEqual(payload.pv, getPasswordVersion(secret, password))
	) {
		return invalidResult;
	}

	return {
		shouldRefresh: payload.exp - nowSeconds < SessionTtlSeconds / 2,
		valid: true,
	};
};
