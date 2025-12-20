import { type Asset } from "@tally/data-models/contracts/asset";
import { convertAssetRowToAsset } from "@tally/data-models/converters/asset";
import { assetRowSchema } from "@tally/data-models/database/assetRow";
import { DatabaseClient } from "./databaseClient";

export class AssetsClient extends DatabaseClient {
	public async getAssetsAsync(): Promise<Asset[]> {
		const rows = await this.database
			.selectFrom("asset")
			.selectAll()
			.orderBy("id", "asc")
			.execute();

		const assets = rows.map((row) => {
			const assetRow = assetRowSchema.parse(row);
			return convertAssetRowToAsset(assetRow);
		});

		return assets;
	}
}
