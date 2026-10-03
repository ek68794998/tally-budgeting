import { type Kysely, type Migration, sql } from "kysely";

const upAsync = async (db: Kysely<unknown>): Promise<void> => {
	// Databases created from the legacy init.sql already have the full schema.
	const { rows } = await sql<{
		exists: boolean;
	}>`SELECT to_regclass('public.asset') IS NOT NULL AS exists`.execute(db);

	if (rows[0]?.exists) {
		return;
	}

	await db.schema
		.createType("asset_type")
		.asEnum([
			"fixed_asset",
			"liquid_asset",
			"personal_asset",
			"long_term_liability",
			"short_term_liability",
		])
		.execute();

	await db.schema
		.createType("budget_type")
		.asEnum(["neutral", "income", "expense"])
		.execute();

	await db.schema
		.createType("txn_direction")
		.asEnum(["debit", "credit"])
		.execute();

	await db.schema
		.createTable("asset")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("name", "text", (col) => col.unique().notNull())
		.addColumn("type", sql`asset_type`)
		.addColumn("value_cents", "bigint")
		.addColumn("provider", "text")
		.addColumn("active", "boolean", (col) => col.notNull().defaultTo(true))
		.execute();

	await db.schema
		.createTable("category")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("label", "text", (col) => col.notNull().unique())
		.execute();

	await sql`INSERT INTO category (id, label) VALUES (-1, 'Uncategorized')`.execute(
		db,
	);

	await db.schema
		.createTable("net_worth_snapshot")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("date", "date", (col) => col.notNull().unique())
		.addColumn("value_cents", "bigint", (col) => col.notNull())
		.execute();

	await db.schema
		.createTable("subcategory")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("label", "text", (col) => col.notNull().unique())
		.addColumn("category", "integer", (col) =>
			col
				.notNull()
				.references("category.id")
				.onDelete("cascade")
				.onUpdate("cascade"),
		)
		.addColumn("description", "text")
		.addColumn("budget_amount_cents", "bigint", (col) =>
			col.notNull().defaultTo(0),
		)
		.addColumn("budget_frequency_months", "integer", (col) =>
			col.notNull().defaultTo(12),
		)
		.addColumn("budget_type", sql`budget_type`, (col) =>
			col.notNull().defaultTo("expense"),
		)
		.addColumn("pct_needs", "integer", (col) => col.notNull().defaultTo(0))
		.addColumn("pct_savings", "integer", (col) =>
			col.notNull().defaultTo(0),
		)
		.execute();

	await sql`INSERT INTO subcategory (id, label, category) VALUES (-1, 'Uncategorized', -1)`.execute(
		db,
	);

	await db.schema
		.createTable("txn")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("merchant", "text", (col) => col.notNull())
		.addColumn("date", "timestamptz")
		.addColumn("account", "integer", (col) =>
			col.references("asset.id").onDelete("set null").onUpdate("cascade"),
		)
		.addColumn("subcategory", "integer", (col) =>
			col
				.notNull()
				.defaultTo(-1)
				.references("subcategory.id")
				.onDelete("set default")
				.onUpdate("cascade"),
		)
		.addColumn("amount_cents", "bigint", (col) =>
			col.notNull().defaultTo(0),
		)
		.addColumn("direction", sql`txn_direction`, (col) =>
			col.notNull().defaultTo("debit"),
		)
		.addColumn("happiness", "integer", (col) => col.notNull().defaultTo(2))
		.addColumn("notes", "text")
		.execute();

	await db.schema
		.createTable("txn_rule")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("pattern", "text", (col) => col.notNull())
		.addColumn("flags", "text", (col) => col.notNull().defaultTo("i"))
		.addColumn("merchant", "text", (col) => col.notNull())
		.addColumn("subcategory", "integer", (col) =>
			col
				.defaultTo(sql`NULL`)
				.references("subcategory.id")
				.onDelete("set default")
				.onUpdate("cascade"),
		)
		.addColumn("priority", "integer", (col) => col.defaultTo(0))
		.addColumn("active", "boolean", (col) => col.defaultTo(true))
		.execute();

	await db.schema
		.createIndex("idx_txn_date")
		.on("txn")
		.column("date")
		.execute();

	await db.schema
		.createIndex("idx_txn_account")
		.on("txn")
		.column("account")
		.execute();

	await db.schema
		.createIndex("idx_txn_subcategory")
		.on("txn")
		.column("subcategory")
		.execute();

	await db.schema
		.createIndex("idx_subcategory_category")
		.on("subcategory")
		.column("category")
		.execute();

	await db.schema
		.createIndex("idx_txn_rule_active")
		.on("txn_rule")
		.column("active")
		.where("active", "=", true)
		.execute();

	await db.schema
		.createIndex("idx_txn_merchant_search")
		.on("txn")
		.using("gin")
		.expression(sql`to_tsvector('english', merchant)`)
		.execute();

	await db.schema
		.createIndex("idx_txn_notes_search")
		.on("txn")
		.using("gin")
		.expression(sql`to_tsvector('english', coalesce(notes, ''))`)
		.execute();
};

const downAsync = async (db: Kysely<unknown>): Promise<void> => {
	await db.schema.dropTable("txn_rule").execute();
	await db.schema.dropTable("txn").execute();
	await db.schema.dropTable("subcategory").execute();
	await db.schema.dropTable("net_worth_snapshot").execute();
	await db.schema.dropTable("category").execute();
	await db.schema.dropTable("asset").execute();
	await db.schema.dropType("txn_direction").execute();
	await db.schema.dropType("budget_type").execute();
	await db.schema.dropType("asset_type").execute();
};

export const initialMigration: Migration = {
	down: downAsync,
	up: upAsync,
};
