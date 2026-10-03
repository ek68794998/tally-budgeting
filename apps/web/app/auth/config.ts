import { readFileSync } from "node:fs";

export type AuthConfig =
	| { mode: "disabled" }
	| { mode: "password"; password: string };

let cachedConfig: AuthConfig | undefined;

export const getAuthConfig = (): AuthConfig => {
	cachedConfig ??= readAuthConfig(process.env);

	return cachedConfig;
};

export const resetAuthConfigForTesting = (): void => {
	cachedConfig = undefined;
};

export const readAuthConfig = (
	env: Record<string, string | undefined>,
): AuthConfig => {
	const {
		APP_PASSWORD: password,
		APP_PASSWORD_FILE: passwordFile,
		DANGEROUSLY_DISABLE_AUTH: disableAuth,
	} = env;

	if (password && passwordFile) {
		throw new Error(
			"Set only one of APP_PASSWORD and APP_PASSWORD_FILE, not both.",
		);
	}

	if (disableAuth === "1") {
		return { mode: "disabled" };
	}

	if (passwordFile) {
		const filePassword = readFileSync(passwordFile, "utf8").trim();

		if (!filePassword) {
			throw new Error(`APP_PASSWORD_FILE (${passwordFile}) is empty.`);
		}

		return { mode: "password", password: filePassword };
	}

	if (password) {
		return { mode: "password", password };
	}

	throw new Error(
		"Authentication is not configured. Set APP_PASSWORD (or APP_PASSWORD_FILE), or set DANGEROUSLY_DISABLE_AUTH=1 to run without authentication.",
	);
};
