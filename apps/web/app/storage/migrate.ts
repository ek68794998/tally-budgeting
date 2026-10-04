import { Migrator } from "kysely";
import { telemetry } from "../telemetry/telemetry";
import { getDatabase } from "./database";
import { migrationProvider } from "./migrations/migrationProvider";

export const migrateToLatestAsync = async (): Promise<void> => {
  const migrator = new Migrator({
    db: getDatabase(),
    provider: migrationProvider,
  });

  const { error, results } = await migrator.migrateToLatest();

  for (const { direction, migrationName, status } of results ?? []) {
    if (status === "Error") {
      telemetry().error("DATABASE_MIGRATION_FAILED", {
        direction,
        migrationName,
      });
    } else {
      telemetry().info("DATABASE_MIGRATION_RESULT", {
        direction,
        migrationName,
        status,
      });
    }
  }

  if (error) {
    telemetry().error("DATABASE_MIGRATION_ABORTED", { error });
    throw new Error("Database migration failed.", { cause: error });
  }
};
