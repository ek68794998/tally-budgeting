import { getDatabase } from "./database";

type ClientDatabaseType = ReturnType<typeof getDatabase>;

export abstract class DatabaseClient {
	protected readonly database: ClientDatabaseType;

	public constructor(database?: ClientDatabaseType) {
		this.database = database ?? getDatabase();
	}
}
