import { PGlite, types } from "@electric-sql/pglite";
import { dangerouslyCoerceType } from "@tally/testing/dangerouslyCoerceType";
import { Kysely, Migrator, PostgresDialect, sql } from "kysely";
import { type Pool } from "pg";
import { type Database } from "../database";
import { migrationProvider } from "../migrations/migrationProvider";

export interface TestDatabase {
	closeAsync: () => Promise<void>;
	database: Kysely<Database>;
	pglite: PGlite;
	resetAsync: () => Promise<void>;
}

// Adapts PGlite to the subset of the `pg` Pool API that Kysely's PostgresDialect uses.
const createPglitePool = (pglite: PGlite) => {
	const client = {
		query: async (statement: string, parameters: unknown[]) => {
			const { affectedRows, rows } = await pglite.query(
				statement,
				parameters,
			);
			const command = statement
				.trimStart()
				.split(/\s/, 1)[0]
				?.toUpperCase();

			return { command, rowCount: affectedRows ?? 0, rows };
		},
		release: () => undefined,
	};

	return dangerouslyCoerceType<Pool>({
		connect: () => Promise.resolve(client),
		end: () => Promise.resolve(),
	});
};

export const createTestDatabaseAsync = async (): Promise<TestDatabase> => {
	const pglite = await PGlite.create({
		// Match `pg`, which returns BIGINT columns as strings.
		parsers: { [types.INT8]: (value: string) => value },
	});

	const database = new Kysely<Database>({
		dialect: new PostgresDialect({ pool: createPglitePool(pglite) }),
	});

	const { error } = await new Migrator({
		db: database,
		provider: migrationProvider,
	}).migrateToLatest();

	if (error) {
		throw new Error("Test database migration failed.", { cause: error });
	}

	const resetAsync = async () => {
		await sql`TRUNCATE app_setting, asset, category, net_worth_snapshot, subcategory, txn, txn_rule RESTART IDENTITY CASCADE`.execute(
			database,
		);
		await sql`INSERT INTO category (id, label) VALUES (-1, 'Uncategorized')`.execute(
			database,
		);
		await sql`INSERT INTO subcategory (id, label, category) VALUES (-1, 'Uncategorized', -1)`.execute(
			database,
		);
	};

	const closeAsync = async () => {
		await database.destroy();
		await pglite.close();
	};

	return { closeAsync, database, pglite, resetAsync };
};

// Defers creation to `setUpAsync` so callers can register it in `beforeAll` inside their `describe`.
export const createTestDatabaseHandle = () => {
	let testDatabase: TestDatabase | undefined;

	const getTestDatabase = () => {
		if (!testDatabase) {
			throw new Error(
				"The test database is only available inside tests.",
			);
		}

		return testDatabase;
	};

	return {
		get database() {
			return getTestDatabase().database;
		},
		resetAsync: () => getTestDatabase().resetAsync(),
		setUpAsync: async () => {
			testDatabase = await createTestDatabaseAsync();
		},
		tearDownAsync: () => getTestDatabase().closeAsync(),
	};
};
