import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import {
	convertSubcategoryRowToSubcategory,
	convertSubcategoryToSubcategoryRow,
} from "@tally/data-models/converters/subcategory";
import { subcategoryRowSchema } from "@tally/data-models/database/subcategoryRow";
import { type Database } from "./database";
import { DatabaseClient } from "./databaseClient";
import { rowOrRowsAsRows } from "./helpers";

export const TableName = "subcategory" as const satisfies keyof Database;

export class SubcategoriesClient extends DatabaseClient {
	public async getSubcategoriesAsync(): Promise<Subcategory[]> {
		const rows = await this.database
			.selectFrom(TableName)
			.selectAll()
			.orderBy("id", "asc")
			.execute();

		const subcategories = rows.map((row) => {
			const subcategoryRow = subcategoryRowSchema.parse(row);
			return convertSubcategoryRowToSubcategory(subcategoryRow);
		});

		return subcategories;
	}

	public async insertSubcategoriesAsync(
		values: Subcategory | Subcategory[],
	): Promise<void> {
		const subcategories = rowOrRowsAsRows(values).map((r) =>
			convertSubcategoryToSubcategoryRow(r),
		);

		await this.database
			.insertInto(TableName)
			.values(subcategories)
			.execute();
	}
}
