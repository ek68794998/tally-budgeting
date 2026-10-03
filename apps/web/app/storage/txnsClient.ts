import { possibleNumberToNumber } from "@ekumlin/typescript-toolkit/number";
import { isBoolean } from "@ekumlin/typescript-toolkit/types";
import { MaxTransactionsPerPage } from "@tally/data-models/contracts/api/getTransactions";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import {
	convertTransactionToTxnRow,
	convertTxnRowToTransaction,
} from "@tally/data-models/converters/transaction";
import { subcategoryRowSchema } from "@tally/data-models/database/subcategoryRow";
import { txnRowSchema } from "@tally/data-models/database/txnRow";
import { parseODataLiteFilter } from "@tally/utilities/oData/parse";
import {
	type ODataLiteFilterExpression,
	type ODataLiteFilterOperator,
} from "@tally/utilities/oData/types";
import { type ExpressionBuilder, type StringReference } from "kysely";
import { type DateTime } from "luxon";
import { type Database } from "./database";
import { DatabaseClient } from "./databaseClient";
import {
	applyPagination,
	buildLikePattern,
	getOrderDirection,
	getQueryCountAsync,
	parseInValues,
	rowOrRowsAsRows,
	withoutId,
} from "./helpers";
import { TableName as SubcategoryTableName } from "./subcategoriesClient";
import { type GetAllQueryResult, type GetRowsOptions } from "./types";

export const TableName = "txn" as const satisfies keyof Database;

export class TxnsClient extends DatabaseClient {
	public async deleteTransactionAsync(id: number): Promise<void> {
		await this.database
			.deleteFrom(TableName)
			.where("id", "=", id)
			.execute();
	}

	public async getTransactionsAsync(
		options?: GetRowsOptions,
	): Promise<GetAllQueryResult<Transaction>> {
		const {
			collectionParams: {
				direction = "ascending",
				filter = "",
				limit = MaxTransactionsPerPage,
				page = 1,
				sortBy = "id",
			} = {},
		} = options || {};

		const filterExpressions = parseODataLiteFilter(filter);

		const query = this.database
			.selectFrom(TableName)
			.leftJoin(
				SubcategoryTableName,
				`${TableName}.subcategory`,
				`${SubcategoryTableName}.id`,
			)
			.where((qb) => applyFilters(qb, filterExpressions));

		const countResult = await getQueryCountAsync(query, `${TableName}.id`);

		const orderColumn = mapSortFieldToColumn(sortBy);
		const orderDirection = getOrderDirection(direction);

		let fetchQuery = query
			.selectAll(["subcategory", "txn"])
			.orderBy(orderColumn, orderDirection)
			.orderBy("date", "desc")
			.orderBy("merchant", "asc");

		fetchQuery = applyPagination(fetchQuery, page, limit);

		const rows = await fetchQuery.execute();

		const transactions = rows.map((row) => {
			const subcategoryRow = subcategoryRowSchema.parse(row);
			const txnRow = txnRowSchema.parse(row);
			return convertTxnRowToTransaction({
				...subcategoryRow,
				...txnRow,
			});
		});

		return {
			data: transactions,
			totalCount: countResult,
		};
	}

	public async getTransactionsInPeriodAsync(
		startDate: DateTime,
		endDate: DateTime,
	): Promise<Transaction[]> {
		if (!startDate.isValid || !endDate.isValid) {
			throw new Error("Invalid date range provided.");
		}

		const rows = await this.database
			.selectFrom(TableName)
			.leftJoin(
				SubcategoryTableName,
				`${TableName}.subcategory`,
				`${SubcategoryTableName}.id`,
			)
			.selectAll("subcategory")
			.selectAll("txn")
			.where("date", ">=", startDate.toJSDate())
			.where("date", "<=", endDate.toJSDate())
			.orderBy("date", "desc")
			.orderBy("merchant", "asc")
			.execute();

		const transactionRules = rows.map((row) => {
			const subcategoryRow = subcategoryRowSchema.parse(row);
			const txnRow = txnRowSchema.parse(row);
			return convertTxnRowToTransaction({
				...subcategoryRow,
				...txnRow,
			});
		});

		return transactionRules;
	}

	public async insertTransactionsAsync(
		values: Transaction | Transaction[],
	): Promise<void> {
		const transactions = rowOrRowsAsRows(values).map((r) =>
			withoutId(convertTransactionToTxnRow(r)),
		);

		if (transactions.length <= 0) {
			return;
		}

		await this.database
			.insertInto(TableName)
			.values(transactions)
			.execute();
	}

	public async updateTransactionAsync(value: Transaction): Promise<void> {
		const row = convertTransactionToTxnRow(value);

		await this.database
			.updateTable(TableName)
			.where("id", "=", row.id)
			.set(row)
			.execute();
	}
}

const comparisonOperators = {
	eq: "=",
	ge: ">=",
	gt: ">",
	le: "<=",
	lt: "<",
	ne: "<>",
} as const satisfies Record<
	Exclude<ODataLiteFilterOperator, "like" | "in">,
	string
>;

const applyFilters = (
	queryBuilder: ExpressionBuilder<Database, typeof TableName>,
	filterExpressions: ODataLiteFilterExpression[],
) => {
	const conditions = filterExpressions.map((fe) => {
		const column = mapFilterFieldToColumn(fe.field);

		if (fe.operator === "like") {
			return queryBuilder.eb(column, "like", buildLikePattern(fe.value));
		}

		if (fe.operator === "in") {
			const values = parseInValues(fe.value, possibleNumberToNumber);
			return queryBuilder.eb(column, "in", values);
		}

		// Kysely doesn't permit us to send Boolean values for comparison
		// if the database has no Boolean columns.
		const value = isBoolean(fe.value) ? `${fe.value}` : fe.value;

		return queryBuilder.eb(column, comparisonOperators[fe.operator], value);
	});

	if (conditions.length === 0) {
		// All transaction IDs should be greater than zero.
		// This is done because an empty `or` clause would match no rows.
		conditions.push(queryBuilder.eb("txn.id", ">", 0));
	}

	return queryBuilder.or(conditions);
};

const mapFilterFieldToColumn = (
	field: string,
): StringReference<Database, typeof TableName> => {
	switch (field) {
		case "account":
			return `${TableName}.account`;
		case "subcategory":
			return `${TableName}.subcategory`;
		case "amount":
			return `${TableName}.amount_cents`;
		case "date":
			return `${TableName}.date`;
		case "merchant":
			return `${TableName}.merchant`;
		default:
			return `${TableName}.id`;
	}
};

const mapSortFieldToColumn = (
	field: string,
): StringReference<
	Database,
	typeof TableName | typeof SubcategoryTableName
> => {
	switch (field) {
		case "amount":
			return `${TableName}.amount_cents`;
		case "date":
			return `${TableName}.date`;
		case "merchant":
			return `${TableName}.merchant`;
		case "category":
		case "subcategory":
			return `${SubcategoryTableName}.label`;
		default:
			return `${TableName}.id`;
	}
};
