import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { convertSubcategoryRowToSubcategory } from "@tally/data-models/converters/subcategory";
import { subcategoryRowSchema } from "@tally/data-models/database/subcategoryRow";
import { DatabaseClient } from "./databaseClient";

const tableName = "subcategory";

export class SubcategoriesClient extends DatabaseClient {
	public constructor() {
		super(tableName);
	}

	public getSubcategoriesAsync(): Promise<Subcategory[]> {
		const { database } = this.databaseSettings;

		const query = `
			SELECT tbl.*
			FROM [${tableName}] tbl
			ORDER BY tbl.id ASC
		`;

		const rows = database.prepare(query).all();
		const subcategories = rows.map((row) => {
			const subcategoryRow = subcategoryRowSchema.parse(row);
			return convertSubcategoryRowToSubcategory(subcategoryRow);
		});

		return Promise.resolve(subcategories);
	}
}
