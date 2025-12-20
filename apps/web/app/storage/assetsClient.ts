import { type Asset } from "@tally/data-models/contracts/asset";
import { convertAssetRowToAsset } from "@tally/data-models/converters/asset";
import { assetRowSchema } from "@tally/data-models/database/assetRow";
import { DatabaseClient } from "./databaseClient";

const tableName = "asset";

export class AssetsClient extends DatabaseClient {
	public constructor() {
		super(tableName);
	}

	public getAssetsAsync(): Promise<Asset[]> {
		const { database } = this.databaseSettings;

		const query = `
			SELECT tbl.*
			FROM [${tableName}] tbl
			ORDER BY tbl.id ASC
		`;

		const rows = database.prepare(query).all();
		const assets = rows.map((row) => {
			const assetRow = assetRowSchema.parse(row);
			return convertAssetRowToAsset(assetRow);
		});

		return Promise.resolve(assets);
	}
}
