import { invariant } from "@ekumlin/typescript-toolkit/values";
import { type AppSettingRow } from "@tally/data-models/database/appSettingRow";
import { type AssetRow } from "@tally/data-models/database/assetRow";
import { type CategoryRow } from "@tally/data-models/database/categoryRow";
import { type NetWorthSnapshotRow } from "@tally/data-models/database/netWorthSnapshotRow";
import { type SubcategoryRow } from "@tally/data-models/database/subcategoryRow";
import { type TxnRow } from "@tally/data-models/database/txnRow";
import { type TxnRuleRow } from "@tally/data-models/database/txnRuleRow";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { telemetry } from "../telemetry/telemetry";
import { type WithGeneratedId } from "./types";

const defaultPoolMax = 10;
const defaultConnectTimeoutMs = 5000;
const defaultQueryTimeoutMs = 15000;

export interface Database {
  app_setting: AppSettingRow; // eslint-disable-line @typescript-eslint/naming-convention
  asset: WithGeneratedId<AssetRow, "id">;
  category: WithGeneratedId<CategoryRow, "id">;
  net_worth_snapshot: WithGeneratedId<NetWorthSnapshotRow, "id">; // eslint-disable-line @typescript-eslint/naming-convention
  subcategory: WithGeneratedId<SubcategoryRow, "id">;
  txn: WithGeneratedId<TxnRow, "id">;
  txn_rule: WithGeneratedId<TxnRuleRow, "id">; // eslint-disable-line @typescript-eslint/naming-convention
}

let database: Kysely<Database> | undefined;

export const getDatabase = (): Kysely<Database> => {
  if (database) {
    return database;
  }

  const {
    POSTGRES_CONNECT_TIMEOUT_MS:
      connectTimeoutMs = `${defaultConnectTimeoutMs}`,
    POSTGRES_CONNECTION_STRING: connectionString,
    POSTGRES_POOL_MAXIMUM: poolMax = `${defaultPoolMax}`,
    POSTGRES_QUERY_TIMEOUT_MS: queryTimeoutMs = `${defaultQueryTimeoutMs}`,
  } = process.env;

  invariant(
    !!connectionString,
    "You must have configured the POSTGRES_CONNECTION_STRING setting in your environment's .env file.",
  );

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: Number.parseInt(connectTimeoutMs, 10),
    max: Number.parseInt(poolMax, 10),
    query_timeout: Number.parseInt(queryTimeoutMs, 10), // eslint-disable-line @typescript-eslint/naming-convention
  });

  // Without a listener, an idle client dropping (e.g., the database container stopping) crashes the process.
  pool.on("error", (error) => {
    telemetry().error("DATABASE_POOL_ERROR", {
      error,
      errorMessage: error.message,
    });
  });

  const dialect = new PostgresDialect({ pool });

  database = new Kysely<Database>({
    dialect,
  });

  return database;
};
