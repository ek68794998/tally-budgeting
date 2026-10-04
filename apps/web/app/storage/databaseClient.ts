import { assertAuthenticatedAsync } from "../auth/verifyRequest";
import { getDatabase } from "./database";

type ClientDatabaseType = ReturnType<typeof getDatabase>;

export abstract class DatabaseClient {
  private readonly database: ClientDatabaseType;

  public constructor(database?: ClientDatabaseType) {
    this.database = database ?? getDatabase();
  }

  protected async getAuthorizedDatabaseAsync(): Promise<ClientDatabaseType> {
    await assertAuthenticatedAsync();

    return this.database;
  }
}
