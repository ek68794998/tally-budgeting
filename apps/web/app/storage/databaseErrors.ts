const unavailableErrorCodes = new Set([
	"ECONNREFUSED",
	"ECONNRESET",
	"EHOSTUNREACH",
	"ENOTFOUND",
	"ETIMEDOUT",
	"57P01", // admin_shutdown
	"57P03", // cannot_connect_now
]);

const unavailableMessagePatterns = [
	/connection terminated/i,
	/query read timeout/i,
	/timeout exceeded when trying to connect/i,
];

export const isDatabaseUnavailableError = (error: unknown): boolean => {
	if (!(error instanceof Error)) {
		return false;
	}

	const code = "code" in error ? error.code : undefined;

	if (typeof code === "string" && unavailableErrorCodes.has(code)) {
		return true;
	}

	if (
		unavailableMessagePatterns.some((pattern) =>
			pattern.test(error.message),
		)
	) {
		return true;
	}

	return isDatabaseUnavailableError(error.cause);
};
