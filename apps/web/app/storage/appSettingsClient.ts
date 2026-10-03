import { randomBytes } from "node:crypto";
import { type Database, getDatabase } from "./database";

export const TableName = "app_setting" as const satisfies keyof Database;

const sessionSecretKey = "session_secret";
const sessionSecretBytes = 32;

let cachedSessionSecret: string | undefined;

// Intentionally bypasses `DatabaseClient`, whose auth check depends on this.
export const getOrCreateSessionSecretAsync = async (): Promise<string> => {
	if (cachedSessionSecret) {
		return cachedSessionSecret;
	}

	try {
		cachedSessionSecret = await loadOrCreateSessionSecretAsync();
	} catch (error) {
		if (isMissingTableError(error)) {
			throw new Error(
				`The "${TableName}" table does not exist. Existing databases must add it manually: CREATE TABLE IF NOT EXISTS app_setting (key TEXT PRIMARY KEY, value TEXT NOT NULL);`,
				{ cause: error },
			);
		}

		throw error;
	}

	return cachedSessionSecret;
};

const postgresUndefinedTableCode = "42P01";

const isMissingTableError = (error: unknown): boolean =>
	typeof error === "object" &&
	error !== null &&
	"code" in error &&
	error.code === postgresUndefinedTableCode;

const loadOrCreateSessionSecretAsync = async (): Promise<string> => {
	const database = getDatabase();

	await database
		.insertInto(TableName)
		.values({
			key: sessionSecretKey,
			value: randomBytes(sessionSecretBytes).toString("base64"),
		})
		.onConflict((oc) => oc.column("key").doNothing())
		.execute();

	const row = await database
		.selectFrom(TableName)
		.select("value")
		.where("key", "=", sessionSecretKey)
		.executeTakeFirstOrThrow();

	return row.value;
};
