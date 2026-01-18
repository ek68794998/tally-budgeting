import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import {
	convertSubcategoryRowToSubcategory,
	convertSubcategoryToSubcategoryRow,
} from "@tally/data-models/converters/subcategory";
import { subcategoryRowSchema } from "@tally/data-models/database/subcategoryRow";
import { type Database } from "./database";
import { DatabaseClient } from "./databaseClient";
import { rowOrRowsAsRows, withoutId } from "./helpers";

export const TableName = "subcategory" as const satisfies keyof Database;

export class SubcategoriesClient extends DatabaseClient {
	public async deleteSubcategoryAsync(id: number): Promise<void> {
		await this.database
			.deleteFrom(TableName)
			.where("id", "=", id)
			.execute();
	}

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
			withoutId(convertSubcategoryToSubcategoryRow(r)),
		);

		await this.database
			.insertInto(TableName)
			.values(subcategories)
			.execute();
	}

	public async updateSubcategoryAsync(value: Subcategory): Promise<void> {
		const row = convertSubcategoryToSubcategoryRow(value);

		await this.database
			.updateTable(TableName)
			.where("id", "=", row.id)
			.set(row)
			.execute();
	}
}
