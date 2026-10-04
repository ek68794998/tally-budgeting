import { type Kysely, type Migration, sql } from "kysely";

const upAsync = async (db: Kysely<unknown>): Promise<void> => {
	await sql`ALTER TABLE app_setting ALTER COLUMN value TYPE jsonb USING to_jsonb(value)`.execute(
		db,
	);
};

const downAsync = async (db: Kysely<unknown>): Promise<void> => {
	await sql`ALTER TABLE app_setting ALTER COLUMN value TYPE text USING value #>> '{}'`.execute(
		db,
	);
};

export const appSettingJsonbMigration: Migration = {
	down: downAsync,
	up: upAsync,
};
