import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import {
	convertTransactionRuleRowToTransactionRule,
	convertTransactionRuleToTransactionRuleRow,
} from "@tally/data-models/converters/transactionRule";
import { transactionRuleRowSchema } from "@tally/data-models/database/transactionRuleRow";
import { DatabaseClient } from "./databaseClient";
import { buildQuery } from "./helpers";

const tableName = "transaction_rule";

export class TransactionRulesClient extends DatabaseClient {
	public constructor() {
		super(tableName);
	}

	public deleteTransactionRuleAsync(id: number): Promise<void> {
		return this.deleteByIdAsync(id);
	}

	public getTransactionRulesAsync(): Promise<TransactionRule[]> {
		const { database } = this.databaseSettings;

		const query = buildQuery(
			`SELECT tbl.*, tbl.subcategory as subcategoryId`,
			`FROM [${tableName}] tbl`,
			`ORDER BY tbl.priority ASC, tbl.id ASC`,
		);

		const rows = database.prepare(query).all();
		const transactionRules = rows.map((row) => {
			const transactionRuleRow = transactionRuleRowSchema.parse(row);
			return convertTransactionRuleRowToTransactionRule(
				transactionRuleRow,
			);
		});

		return Promise.resolve(transactionRules);
	}

	public insertTransactionRulesAsync(
		values: TransactionRule[],
	): Promise<void> {
		const { database } = this.databaseSettings;

		const transactionRules = Array.isArray(values) ? values : [values];

		const query = buildQuery(
			`INSERT INTO [${tableName}] (flags, isActive, merchant, pattern, priority, subcategory)`,
			`VALUES (?, ?, ?, ?, ?, ?)`,
		);

		for (const transactionRule of transactionRules) {
			const {
				flags,
				isActive,
				merchant,
				pattern,
				priority,
				subcategoryId,
			} = convertTransactionRuleToTransactionRuleRow(transactionRule);

			database
				.prepare(query)
				.run(
					flags,
					isActive,
					merchant,
					pattern,
					priority,
					subcategoryId,
				);
		}

		return Promise.resolve();
	}

	public updateTransactionRuleAsync(value: TransactionRule): Promise<void> {
		const { database } = this.databaseSettings;

		const {
			flags,
			id,
			isActive,
			merchant,
			pattern,
			priority,
			subcategoryId,
		} = convertTransactionRuleToTransactionRuleRow(value);

		const query = buildQuery(
			`UPDATE [${tableName}]`,
			`SET flags = ?, isActive = ?, merchant = ?, pattern = ?, priority = ?, subcategory = ?`,
			`WHERE id = ?`,
		);

		database
			.prepare(query)
			.run(
				flags,
				isActive,
				merchant,
				pattern,
				priority,
				subcategoryId,
				id,
			);

		return Promise.resolve();
	}
}
