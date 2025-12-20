import { type Category } from "@tally/data-models/contracts/category";
import { convertCategoryRowToCategory } from "@tally/data-models/converters/category";
import { categoryRowSchema } from "@tally/data-models/database/categoryRow";
import { DatabaseClient } from "./databaseClient";

const tableName = "category";

export class CategoriesClient extends DatabaseClient {
	public constructor() {
		super(tableName);
	}

	public getCategoriesAsync(): Promise<Category[]> {
		const { database } = this.databaseSettings;

		const query = `
			SELECT tbl.*
			FROM [${tableName}] tbl
			ORDER BY tbl.id ASC
		`;

		const rows = database.prepare(query).all();
		const categories = rows.map((row) => {
			const categoryRow = categoryRowSchema.parse(row);
			return convertCategoryRowToCategory(categoryRow);
		});

		return Promise.resolve(categories);
	}
}
