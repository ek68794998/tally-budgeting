import { possibleNumberToNumber } from "@ekumlin/typescript-toolkit/number";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import { MaxTransactionsPerPage } from "@tally/data-models/contracts/api/getTransactions";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import {
	convertTransactionRowToTransaction,
	convertTransactionToTransactionRow,
} from "@tally/data-models/converters/transaction";
import { countRowSchema } from "@tally/data-models/database/countRow";
import { transactionRowSchema } from "@tally/data-models/database/transactionRow";
import { parseODataLiteFilter } from "@tally/utilities/oData/parse";
import { DatabaseClient } from "./databaseClient";
import { buildQuery } from "./helpers";
import { type GetAllQueryResult, type GetRowsOptions } from "./types";

const tableName = "transaction";

export class TransactionsClient extends DatabaseClient {
	public constructor() {
		super(tableName);
	}

	public deleteTransactionRuleAsync(id: number): Promise<void> {
		return this.deleteByIdAsync(id);
	}

	public getTransactionsAsync(
		options?: GetRowsOptions,
	): Promise<GetAllQueryResult<Transaction>> {
		const mapFilterFieldToColumn = (field: string): string => {
			switch (field) {
				case "account":
					return "tbl.account";
				case "subcategory":
					return "sc.id";
				default:
					return mapSortFieldToColumn(field);
			}
		};

		const mapSortFieldToColumn = (field: string): string => {
			switch (field) {
				case "amount":
					return "tbl.amountCents";
				case "date":
					return "tbl.dateIso";
				case "merchant":
					return "tbl.merchant";
				case "category":
				case "subcategory":
					return "sc.label";
				default:
					return "tbl.id";
			}
		};

		const { database } = this.databaseSettings;
		const {
			collectionParams: {
				direction = "ascending",
				filter = "",
				limit = MaxTransactionsPerPage,
				page = 1,
				sortBy = "id",
			} = {},
		} = options || {};

		const orderDirection = direction === "ascending" ? "ASC" : "DESC";
		const orderBy = mapSortFieldToColumn(sortBy);
		const skip = (page - 1) * limit;
		const top = limit;

		const filterExpressions = parseODataLiteFilter(filter);

		const queryParameters: Record<string, unknown> = {};
		const filtersAndJoins = [
			`FROM [${tableName}] tbl`,
			`LEFT JOIN subcategory sc ON tbl.subcategory = sc.id`,
		];

		let conditionOperator = "WHERE";

		for (let i = 0; i < filterExpressions.length; i++) {
			const filterExpression = filterExpressions[i];
			invariant(filterExpression);

			let parameterKey: string | null = `param${i + 1}`;
			let filterValue: unknown;

			if (filterExpression.operator === "eq") {
				const filterColumn = mapFilterFieldToColumn(
					filterExpression.field,
				);
				filterValue = filterExpression.value;
				filtersAndJoins.push(
					`${conditionOperator} ${filterColumn} = :${parameterKey}`,
				);
			} else if (filterExpression.operator === "like") {
				const filterColumn = mapFilterFieldToColumn(
					filterExpression.field,
				);
				filterValue = `%${String(filterExpression.value)}%`;
				filtersAndJoins.push(
					`${conditionOperator} ${filterColumn} LIKE :${parameterKey}`,
				);
			} else if (filterExpression.operator === "in") {
				const filterColumn = mapFilterFieldToColumn(
					filterExpression.field,
				);
				const filterArray = String(filterExpression.value)
					.split(",")
					.map(possibleNumberToNumber)
					.filter(Boolean)
					.join(",");
				filtersAndJoins.push(
					`${conditionOperator} ${filterColumn} IN (${filterArray})`,
				);
				parameterKey = null;
			} else {
				continue;
			}

			if (parameterKey) {
				queryParameters[parameterKey] = filterValue;
			}

			conditionOperator = "AND";
		}

		filtersAndJoins.push(
			`ORDER BY ${orderBy} ${orderDirection}, tbl.dateIso DESC, tbl.merchant ASC`,
		);

		const fetchQuery = buildQuery(
			`SELECT tbl.*, tbl.account as accountId, sc.category as categoryId, tbl.subcategory as subcategoryId`,
			...filtersAndJoins,
			`LIMIT ${top} OFFSET ${skip}`,
		);

		const countQuery = buildQuery(
			`SELECT COUNT(*) as count`,
			...filtersAndJoins,
		);

		const countRow = database.prepare(countQuery).get(queryParameters);
		const { count } = countRowSchema.parse(countRow);

		const rows = database.prepare(fetchQuery).all(queryParameters);
		const transactions = rows.map((row) => {
			const transactionRow = transactionRowSchema.parse(row);
			return convertTransactionRowToTransaction(transactionRow);
		});

		return Promise.resolve({ data: transactions, totalCount: count });
	}

	public getTransactionsInPeriodAsync(
		startDate: string,
		endDate: string,
	): Promise<Transaction[]> {
		const { database } = this.databaseSettings;

		const query = buildQuery(
			`SELECT tbl.*, tbl.account as accountId, sc.category as categoryId, tbl.subcategory as subcategoryId`,
			`FROM [${tableName}] tbl`,
			`LEFT JOIN subcategory sc ON tbl.subcategory = sc.id`,
			`WHERE tbl.dateIso BETWEEN :startDate AND :endDate`,
			`ORDER BY tbl.dateIso DESC, tbl.merchant ASC`,
		);

		const queryParameters = { endDate, startDate };

		const rows = database.prepare(query).all(queryParameters);
		const transactions = rows.map((row) => {
			const transactionRow = transactionRowSchema.parse(row);
			return convertTransactionRowToTransaction(transactionRow);
		});

		return Promise.resolve(transactions);
	}

	public insertTransactionsAsync(
		values: Transaction | Transaction[],
	): Promise<void> {
		const { database } = this.databaseSettings;

		const transactions = Array.isArray(values) ? values : [values];

		const query = buildQuery(
			`INSERT INTO [${tableName}] (account, amountCents, dateIso, direction, merchant, notes, subcategory)`,
			`VALUES (?, ?, ?, ?, ?, ?, ?)`,
		);

		for (const transaction of transactions) {
			const {
				accountId,
				amountCents,
				dateIso,
				direction,
				merchant,
				notes,
				subcategoryId,
			} = convertTransactionToTransactionRow(transaction);

			database
				.prepare(query)
				.run(
					accountId,
					amountCents,
					dateIso,
					direction,
					merchant,
					notes,
					subcategoryId,
				);
		}

		return Promise.resolve();
	}

	public updateTransactionAsync(value: Transaction): Promise<void> {
		const { database } = this.databaseSettings;

		const {
			accountId,
			amountCents,
			dateIso,
			direction,
			id,
			merchant,
			notes,
			subcategoryId,
		} = convertTransactionToTransactionRow(value);

		const query = buildQuery(
			`UPDATE [${tableName}]`,
			`SET account = ?, amountCents = ?, dateIso = ?, direction = ?, merchant = ?, notes = ?, subcategory = ?`,
			`WHERE id = ?`,
		);

		database
			.prepare(query)
			.run(
				accountId,
				amountCents,
				dateIso,
				direction,
				merchant,
				notes,
				subcategoryId,
				id,
			);

		return Promise.resolve();
	}
}
