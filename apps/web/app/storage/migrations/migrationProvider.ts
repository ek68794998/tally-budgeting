import { type Migration, type MigrationProvider } from "kysely";
import { initialMigration } from "./0001_initial";

// Order matters: Kysely sorts by name, so names must keep a numeric prefix.
export const migrationEntries: [string, Migration][] = [
	["0001_initial", initialMigration],
];

export const migrationProvider: MigrationProvider = {
	getMigrations: () => Promise.resolve(Object.fromEntries(migrationEntries)),
};
