import { sql } from "kysely";
import { resetSessionSecretCache } from "./appSettingsClient";
import { DatabaseClient } from "./databaseClient";
import { runPgRestoreAsync } from "./databaseTools";
import { migrateToLatestAsync } from "./migrate";

export class DatabaseAdminClient extends DatabaseClient {
	/** Wipes the schema, then re-runs every migration to leave an empty, working database. */
	public async dropAllDataAsync(): Promise<void> {
		const database = await this.getAuthorizedDatabaseAsync();

		await database.transaction().execute(async (transaction) => {
			await sql`DROP SCHEMA public CASCADE`.execute(transaction);
			await sql`CREATE SCHEMA public`.execute(transaction);
		});

		resetSessionSecretCache();
		await migrateToLatestAsync();
	}

	/** Restores a `pg_dump -Fc` file, then brings an older backup up to date. */
	public async restoreAsync(filePath: string): Promise<void> {
		await this.getAuthorizedDatabaseAsync();

		await runPgRestoreAsync(filePath);

		resetSessionSecretCache();
		await migrateToLatestAsync();
	}
}
