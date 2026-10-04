import {
  type TransactionRule,
  type TransactionRuleFields,
} from "@tally/data-models/contracts/transactionRule";
import {
  convertTransactionRuleFieldsToTxnRuleRow,
  convertTxnRuleRowToTransactionRule,
} from "@tally/data-models/converters/transactionRule";
import { txnRuleRowSchema } from "@tally/data-models/database/txnRuleRow";
import { type Database } from "./database";
import { DatabaseClient } from "./databaseClient";
import { rowOrRowsAsRows } from "./helpers";

export const TableName = "txn_rule" as const satisfies keyof Database;

export class TxnRulesClient extends DatabaseClient {
  public async deleteTransactionRuleAsync(id: number): Promise<void> {
    const database = await this.getAuthorizedDatabaseAsync();

    await database.deleteFrom(TableName).where("id", "=", id).execute();
  }

  public async getTransactionRulesAsync(): Promise<TransactionRule[]> {
    const database = await this.getAuthorizedDatabaseAsync();

    const rows = await database
      .selectFrom(TableName)
      .selectAll()
      .orderBy("priority", "asc")
      .orderBy("id", "asc")
      .execute();

    const transactionRules = rows.map((row) => {
      const txnRuleRow = txnRuleRowSchema.parse(row);
      return convertTxnRuleRowToTransactionRule(txnRuleRow);
    });

    return transactionRules;
  }

  public async insertTransactionRulesAsync(
    values: TransactionRuleFields | TransactionRuleFields[],
  ): Promise<void> {
    const database = await this.getAuthorizedDatabaseAsync();

    const transactionRules = rowOrRowsAsRows(values).map(
      convertTransactionRuleFieldsToTxnRuleRow,
    );

    if (transactionRules.length === 0) {
      return;
    }

    await database.transaction().execute(async (trx) => {
      const { maxPriority } = await trx
        .selectFrom(TableName)
        .select((eb) =>
          eb.fn.coalesce(eb.fn.max("priority"), eb.val(-1)).as("maxPriority"),
        )
        .executeTakeFirstOrThrow();

      const firstPriority = maxPriority + 1;

      await trx
        .insertInto(TableName)
        .values(
          transactionRules.map((rule, index) => ({
            ...rule,
            priority: firstPriority + index,
          })),
        )
        .execute();
    });
  }

  public async updateTransactionRuleAsync(
    value: TransactionRuleFields & { id: number },
  ): Promise<boolean> {
    const database = await this.getAuthorizedDatabaseAsync();

    const { id, ...fields } = value;

    const { numUpdatedRows } = await database
      .updateTable(TableName)
      .where("id", "=", id)
      .set(convertTransactionRuleFieldsToTxnRuleRow(fields))
      .executeTakeFirstOrThrow();

    return numUpdatedRows > 0n;
  }

  public async updateTransactionRulesOrderAsync(
    ruleIds: number[],
  ): Promise<void> {
    const database = await this.getAuthorizedDatabaseAsync();

    await database.transaction().execute(async (trx) => {
      for (const [index, id] of ruleIds.entries()) {
        // Skip checking if the rows exist.
        // This ensures that if you delete it on one tab, and
        // reorder it on another, the command will not fail.
        await trx
          .updateTable(TableName)
          .where("id", "=", id)
          .set({ priority: index })
          .execute();
      }
    });
  }
}
