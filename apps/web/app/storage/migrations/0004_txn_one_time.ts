import { type Kysely, type Migration } from "kysely";

const upAsync = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema
    .alterTable("txn")
    .addColumn("one_time", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createIndex("idx_txn_one_time")
    .on("txn")
    .column("one_time")
    .where("one_time", "=", true)
    .execute();
};

const downAsync = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.dropIndex("idx_txn_one_time").execute();
  await db.schema.alterTable("txn").dropColumn("one_time").execute();
};

export const txnOneTimeMigration: Migration = {
  down: downAsync,
  up: upAsync,
};
