const fallbackPath = "/";
const placeholderOrigin = "http://localhost";

export const getSafeRedirectPath = (value: unknown): string => {
	if (
		typeof value !== "string" ||
		!value.startsWith("/") ||
		value.startsWith("//") ||
		value.startsWith("/\\")
	) {
		return fallbackPath;
	}

	try {
		const url = new URL(value, placeholderOrigin);

		if (url.origin !== placeholderOrigin) {
			return fallbackPath;
		}

		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return fallbackPath;
	}
};
