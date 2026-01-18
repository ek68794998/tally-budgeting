import { type Category } from "@tally/data-models/contracts/category";
import {
	convertCategoryRowToCategory,
	convertCategoryToCategoryRow,
} from "@tally/data-models/converters/category";
import { categoryRowSchema } from "@tally/data-models/database/categoryRow";
import { type Database } from "./database";
import { DatabaseClient } from "./databaseClient";
import { rowOrRowsAsRows, withoutId } from "./helpers";

export const TableName = "category" as const satisfies keyof Database;

export class CategoriesClient extends DatabaseClient {
	public async deleteCategoryAsync(id: number): Promise<void> {
		await this.database
			.deleteFrom(TableName)
			.where("id", "=", id)
			.execute();
	}

	public async getCategoriesAsync(): Promise<Category[]> {
		const rows = await this.database
			.selectFrom(TableName)
			.selectAll()
			.orderBy("id", "asc")
			.execute();

		const categories = rows.map((row) => {
			const categoryRow = categoryRowSchema.parse(row);
			return convertCategoryRowToCategory(categoryRow);
		});

		return categories;
	}

	public async insertCategoriesAsync(
		values: Category | Category[],
	): Promise<void> {
		const categories = rowOrRowsAsRows(values).map((r) =>
			withoutId(convertCategoryToCategoryRow(r)),
		);

		await this.database.insertInto(TableName).values(categories).execute();
	}

	public async updateCategoryAsync(value: Category): Promise<void> {
		const row = convertCategoryToCategoryRow(value);

		await this.database
			.updateTable(TableName)
			.where("id", "=", row.id)
			.set(row)
			.execute();
	}
}
