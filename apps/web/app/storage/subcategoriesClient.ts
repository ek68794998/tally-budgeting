import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { convertSubcategoryRowToSubcategory } from "@tally/data-models/converters/subcategory";
import { subcategoryRowSchema } from "@tally/data-models/database/subcategoryRow";
import { DatabaseClient } from "./databaseClient";

export class SubcategoriesClient extends DatabaseClient {
	public async getSubcategoriesAsync(): Promise<Subcategory[]> {
		const rows = await this.database
			.selectFrom("subcategory")
			.selectAll()
			.orderBy("id", "asc")
			.execute();

		const subcategories = rows.map((row) => {
			const subcategoryRow = subcategoryRowSchema.parse(row);
			return convertSubcategoryRowToSubcategory(subcategoryRow);
		});

		return subcategories;
	}
}
