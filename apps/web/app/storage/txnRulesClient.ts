import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import {
	convertTransactionRuleToTxnRuleRow,
	convertTxnRuleRowToTransactionRule,
} from "@tally/data-models/converters/transactionRule";
import { txnRuleRowSchema } from "@tally/data-models/database/txnRuleRow";
import { type Database } from "./database";
import { DatabaseClient } from "./databaseClient";
import { rowOrRowsAsRows, withoutId } from "./helpers";

export const TableName = "txn_rule" as const satisfies keyof Database;

export class TxnRulesClient extends DatabaseClient {
	public async deleteTransactionRuleAsync(id: number): Promise<void> {
		await this.database
			.deleteFrom(TableName)
			.where("id", "=", id)
			.execute();
	}

	public async getTransactionRulesAsync(): Promise<TransactionRule[]> {
		const rows = await this.database
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
		values: TransactionRule | TransactionRule[],
	): Promise<void> {
		const transactionRules = rowOrRowsAsRows(values).map((r) =>
			withoutId(convertTransactionRuleToTxnRuleRow(r)),
		);

		await this.database
			.insertInto(TableName)
			.values(transactionRules)
			.execute();
	}

	public async updateTransactionRuleAsync(
		value: TransactionRule,
	): Promise<void> {
		const row = convertTransactionRuleToTxnRuleRow(value);

		await this.database
			.updateTable(TableName)
			.where("id", "=", row.id)
			.set(row)
			.execute();
	}

	public async updateTransactionRulesOrderAsync(
		ruleIds: number[],
	): Promise<void> {
		await this.database.transaction().execute(async (trx) => {
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
