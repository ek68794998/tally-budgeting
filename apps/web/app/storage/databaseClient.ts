import { getDatabase } from "./database";

export class DatabaseClient {
	protected readonly database = getDatabase();
}
