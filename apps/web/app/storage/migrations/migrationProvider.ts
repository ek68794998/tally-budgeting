import { type Migration, type MigrationProvider } from "kysely";
import { initialMigration } from "./0001_initial";
import { appSettingMigration } from "./0002_app_setting";
import { appSettingJsonbMigration } from "./0003_app_setting_jsonb";

// Order matters: Kysely sorts by name, so names must keep a numeric prefix.
export const migrationEntries: [string, Migration][] = [
  ["0001_initial", initialMigration],
  ["0002_app_setting", appSettingMigration],
  ["0003_app_setting_jsonb", appSettingJsonbMigration],
];

export const migrationProvider: MigrationProvider = {
  getMigrations: () => Promise.resolve(Object.fromEntries(migrationEntries)),
};
