import {
  type Category,
  type CategoryFields,
} from "@tally/data-models/contracts/category";
import {
  convertCategoryFieldsToCategoryRow,
  convertCategoryRowToCategory,
  convertCategoryToCategoryRow,
} from "@tally/data-models/converters/category";
import { categoryRowSchema } from "@tally/data-models/database/categoryRow";
import { type Database } from "./database";
import { DatabaseClient } from "./databaseClient";
import { rowOrRowsAsRows } from "./helpers";

export const TableName = "category" as const satisfies keyof Database;

export class CategoriesClient extends DatabaseClient {
  public async deleteCategoryAsync(id: number): Promise<void> {
    const database = await this.getAuthorizedDatabaseAsync();

    await database.deleteFrom(TableName).where("id", "=", id).execute();
  }

  public async getCategoriesAsync(): Promise<Category[]> {
    const database = await this.getAuthorizedDatabaseAsync();

    const rows = await database
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
    values: CategoryFields | CategoryFields[],
  ): Promise<void> {
    const database = await this.getAuthorizedDatabaseAsync();

    const categories = rowOrRowsAsRows(values).map(
      convertCategoryFieldsToCategoryRow,
    );

    await database.insertInto(TableName).values(categories).execute();
  }

  public async updateCategoryAsync(value: Category): Promise<boolean> {
    const database = await this.getAuthorizedDatabaseAsync();

    const row = convertCategoryToCategoryRow(value);

    const { numUpdatedRows } = await database
      .updateTable(TableName)
      .where("id", "=", row.id)
      .set(row)
      .executeTakeFirstOrThrow();

    return numUpdatedRows > 0n;
  }
}
