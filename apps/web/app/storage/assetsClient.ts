import {
	type Asset,
	type AssetFields,
} from "@tally/data-models/contracts/asset";
import {
	convertAssetFieldsToAssetRow,
	convertAssetRowToAsset,
	convertAssetToAssetRow,
} from "@tally/data-models/converters/asset";
import { assetRowSchema } from "@tally/data-models/database/assetRow";
import { type Database } from "./database";
import { DatabaseClient } from "./databaseClient";
import { rowOrRowsAsRows } from "./helpers";

export const TableName = "asset" as const satisfies keyof Database;

export class AssetsClient extends DatabaseClient {
	public async deleteAssetAsync(id: number): Promise<void> {
		const database = await this.getAuthorizedDatabaseAsync();

		await database.deleteFrom(TableName).where("id", "=", id).execute();
	}

	public async getAssetsAsync(): Promise<Asset[]> {
		const database = await this.getAuthorizedDatabaseAsync();

		const rows = await database
			.selectFrom(TableName)
			.selectAll()
			.orderBy("id", "asc")
			.execute();

		const assets = rows.map((row) => {
			const assetRow = assetRowSchema.parse(row);
			return convertAssetRowToAsset(assetRow);
		});

		return assets;
	}

	public async insertAssetsAsync(
		values: AssetFields | AssetFields[],
	): Promise<void> {
		const database = await this.getAuthorizedDatabaseAsync();

		const assets = rowOrRowsAsRows(values).map(
			convertAssetFieldsToAssetRow,
		);

		await database.insertInto(TableName).values(assets).execute();
	}

	public async updateAssetAsync(value: Asset): Promise<boolean> {
		const database = await this.getAuthorizedDatabaseAsync();

		const row = convertAssetToAssetRow(value);

		const { numUpdatedRows } = await database
			.updateTable(TableName)
			.where("id", "=", row.id)
			.set(row)
			.executeTakeFirstOrThrow();

		return numUpdatedRows > 0n;
	}
}
