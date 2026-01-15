import { type Asset } from "@tally/data-models/contracts/asset";
import {
	convertAssetRowToAsset,
	convertAssetToAssetRow,
} from "@tally/data-models/converters/asset";
import { assetRowSchema } from "@tally/data-models/database/assetRow";
import { type Database } from "./database";
import { DatabaseClient } from "./databaseClient";
import { rowOrRowsAsRows, withoutId } from "./helpers";

export const TableName = "asset" as const satisfies keyof Database;

export class AssetsClient extends DatabaseClient {
	public async deleteAssetAsync(id: number): Promise<void> {
		await this.database
			.deleteFrom(TableName)
			.where("id", "=", id)
			.execute();
	}

	public async getAssetsAsync(): Promise<Asset[]> {
		const rows = await this.database
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

	public async insertAssetsAsync(values: Asset | Asset[]): Promise<void> {
		const assets = rowOrRowsAsRows(values).map((r) =>
			withoutId(convertAssetToAssetRow(r)),
		);

		await this.database.insertInto(TableName).values(assets).execute();
	}

	public async updateAssetAsync(value: Asset): Promise<void> {
		const row = convertAssetToAssetRow(value);

		await this.database
			.updateTable(TableName)
			.where("id", "=", row.id)
			.set(row)
			.execute();
	}
}
