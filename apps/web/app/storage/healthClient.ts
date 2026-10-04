import { sql } from "kysely";
import { getDatabase } from "./database";

// Intentionally bypasses `DatabaseClient`; health checks are public.
export const pingDatabaseAsync = async (): Promise<void> => {
  await sql`select 1`.execute(getDatabase());
};
