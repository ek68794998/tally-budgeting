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
		const database = await this.getAuthorizedDatabaseAsync();

		await database.deleteFrom(TableName).where("id", "=", id).execute();
	}

	public async getSubcategoriesAsync(): Promise<Subcategory[]> {
		const database = await this.getAuthorizedDatabaseAsync();

		const rows = await database
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
		const database = await this.getAuthorizedDatabaseAsync();

		const subcategories = rowOrRowsAsRows(values).map((r) =>
			withoutId(convertSubcategoryToSubcategoryRow(r)),
		);

		await database.insertInto(TableName).values(subcategories).execute();
	}

	public async updateSubcategoryAsync(value: Subcategory): Promise<void> {
		const database = await this.getAuthorizedDatabaseAsync();

		const row = convertSubcategoryToSubcategoryRow(value);

		await database
			.updateTable(TableName)
			.where("id", "=", row.id)
			.set(row)
			.execute();
	}
}
