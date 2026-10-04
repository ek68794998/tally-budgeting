import { randomBytes } from "node:crypto";
import z from "zod";
import { type Database, getDatabase } from "./database";
import { toJsonb } from "./helpers";

export const TableName = "app_setting" as const satisfies keyof Database;

const sessionSecretKey = "session_secret";
const sessionSecretBytes = 32;

let cachedSessionSecret: string | undefined;

// Restoring or wiping the database replaces the secret, which signs everyone out.
export const resetSessionSecretCache = (): void => {
  cachedSessionSecret = undefined;
};

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
      value: toJsonb(randomBytes(sessionSecretBytes).toString("base64")),
    })
    .onConflict((oc) => oc.column("key").doNothing())
    .execute();

  const row = await database
    .selectFrom(TableName)
    .select("value")
    .where("key", "=", sessionSecretKey)
    .executeTakeFirstOrThrow();

  cachedSessionSecret = z.string().parse(row.value);

  return cachedSessionSecret;
};
