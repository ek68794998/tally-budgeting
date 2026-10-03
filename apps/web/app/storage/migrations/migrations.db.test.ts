import { type Kysely, Migrator, NO_MIGRATIONS, sql } from "kysely";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Database } from "../database";
import {
	createTestDatabaseAsync,
	type TestDatabase,
} from "../testing/testDatabase";
import { initialMigration } from "./0001_initial";
import { migrationProvider } from "./migrationProvider";

const listTablesAsync = async (database: Kysely<Database>) => {
	const { rows } = await sql<{
		tablename: string;
	}>`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'kysely_%' ORDER BY tablename`.execute(
		database,
	);

	return rows.map(({ tablename }) => tablename);
};

const allTables = [
	"app_setting",
	"asset",
	"category",
	"net_worth_snapshot",
	"subcategory",
	"txn",
	"txn_rule",
];

describe("migrations", () => {
	let testDatabase: TestDatabase;

	beforeAll(async () => {
		testDatabase = await createTestDatabaseAsync();
	});

	afterAll(async () => {
		await testDatabase.closeAsync();
	});

	it("creates every table with the default category and subcategory seeded", async () => {
		const { database } = testDatabase;

		await expect(listTablesAsync(database)).resolves.toEqual(allTables);
		await expect(
			database
				.selectFrom("subcategory")
				.select(["id", "category"])
				.execute(),
		).resolves.toEqual([{ category: -1, id: -1 }]);
	});

	it("rolls every migration back down, then reapplies them", async () => {
		const { database } = testDatabase;
		const migrator = new Migrator({
			db: database,
			provider: migrationProvider,
		});

		const down = await migrator.migrateTo(NO_MIGRATIONS);

		expect(down.error).toBeUndefined();
		await expect(listTablesAsync(database)).resolves.toEqual([]);

		const up = await migrator.migrateToLatest();

		expect(up.error).toBeUndefined();
		await expect(listTablesAsync(database)).resolves.toEqual(allTables);
	});

	it("skips the initial schema when a legacy database already has it", async () => {
		const { database } = testDatabase;
		const typesBefore = await sql<{
			count: string;
		}>`SELECT count(*) FROM pg_type WHERE typname = 'asset_type'`.execute(
			database,
		);

		await initialMigration.up(database);

		const typesAfter = await sql<{
			count: string;
		}>`SELECT count(*) FROM pg_type WHERE typname = 'asset_type'`.execute(
			database,
		);

		expect(typesAfter.rows).toEqual(typesBefore.rows);
	});
});
