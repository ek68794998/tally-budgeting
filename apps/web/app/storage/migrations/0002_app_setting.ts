import { type Kysely, type Migration } from "kysely";

const upAsync = async (db: Kysely<unknown>): Promise<void> => {
	await db.schema
		.createTable("app_setting")
		.ifNotExists()
		.addColumn("key", "text", (col) => col.primaryKey())
		.addColumn("value", "text", (col) => col.notNull())
		.execute();
};

const downAsync = async (db: Kysely<unknown>): Promise<void> => {
	await db.schema.dropTable("app_setting").execute();
};

export const appSettingMigration: Migration = {
	down: downAsync,
	up: upAsync,
};
