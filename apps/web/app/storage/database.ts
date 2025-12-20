import { invariant } from "@ekumlin/typescript-toolkit/values";
import { type AssetRow } from "@tally/data-models/database/assetRow";
import { type CategoryRow } from "@tally/data-models/database/categoryRow";
import { type SubcategoryRow } from "@tally/data-models/database/subcategoryRow";
import { type TxnRow } from "@tally/data-models/database/txnRow";
import { type TxnRuleRow } from "@tally/data-models/database/txnRuleRow";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const defaultPoolMax = 10;

export interface Database {
	asset: AssetRow;
	category: CategoryRow;
	subcategory: SubcategoryRow;
	txn: TxnRow;
	txnRule: TxnRuleRow;
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
		connectionString,
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
