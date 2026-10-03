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

	cachedSessionSecret = row.value;

	return cachedSessionSecret;
};
