import { getDatabaseSettings } from "./database";
import { buildQuery } from "./helpers";

export class DatabaseClient {
	protected readonly databaseSettings = getDatabaseSettings();
	protected readonly tableName: string;

	protected constructor(tableName: string) {
		this.tableName = tableName;
	}

	protected deleteByIdAsync(id: number): Promise<void> {
		const { database } = this.databaseSettings;

		const query = buildQuery(
			`DELETE FROM [${this.tableName}]`,
			`WHERE id = ?`,
		);

		database.prepare(query).run(id);

		return Promise.resolve();
	}
}
