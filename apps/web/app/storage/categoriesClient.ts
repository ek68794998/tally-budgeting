import { type Category } from "@tally/data-models/contracts/category";
import { convertCategoryRowToCategory } from "@tally/data-models/converters/category";
import { categoryRowSchema } from "@tally/data-models/database/categoryRow";
import { DatabaseClient } from "./databaseClient";

export class CategoriesClient extends DatabaseClient {
	public async getCategoriesAsync(): Promise<Category[]> {
		const rows = await this.database
			.selectFrom("category")
			.selectAll()
			.orderBy("id", "asc")
			.execute();

		const categories = rows.map((row) => {
			const categoryRow = categoryRowSchema.parse(row);
			return convertCategoryRowToCategory(categoryRow);
		});

		return categories;
	}
}
