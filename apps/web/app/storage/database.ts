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
import { type WithGeneratedId } from "./types";

const defaultPoolMax = 10;

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
		POSTGRES_CONNECTION_STRING: connectionString,
		POSTGRES_POOL_MAXIMUM: poolMax = `${defaultPoolMax}`,
	} = process.env;

	invariant(
		!!connectionString,
		"You must have configured the POSTGRES_CONNECTION_STRING setting in your environment's .env file.",
	);

	const dialect = new PostgresDialect({
		pool: new Pool({
			connectionString,
			max: Number.parseInt(poolMax, 10),
		}),
	});

	database = new Kysely<Database>({
		dialect,
	});

	return database;
};
