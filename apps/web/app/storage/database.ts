import Sqlite3 from "better-sqlite3";
import { AppConfiguration } from "../config";

// TODO (#1) Replace with Postgres

const dbFilePath = AppConfiguration.databasePath;

let database: Sqlite3.Database | undefined;

export interface DatabaseSettings {
	database: Sqlite3.Database;
}

export const getDatabaseSettings = (): DatabaseSettings => {
	if (!database) {
		database = new Sqlite3(dbFilePath);

		// Enable WAL mode (https://github.com/WiseLibs/better-sqlite3/issues/262#issuecomment-549872386)
		database.pragma("journal_mode = WAL");
	}

	return { database };
};
