import { type NetWorthSnapshot } from "@tally/data-models/contracts/netWorthSnapshot";
import {
	convertNetWorthSnapshotRowToNetWorthSnapshot,
	convertNetWorthSnapshotToNetWorthSnapshotRow,
} from "@tally/data-models/converters/netWorthSnapshot";
import { netWorthSnapshotRowSchema } from "@tally/data-models/database/netWorthSnapshotRow";
import { withoutId } from "@tally/utilities/object/withoutId";
import { type Database } from "./database";
import { DatabaseClient } from "./databaseClient";
import { rowOrRowsAsRows } from "./helpers";

export const TableName = "net_worth_snapshot" as const satisfies keyof Database;

export class NetWorthSnapshotsClient extends DatabaseClient {
	public async getNetWorthSnapshotsAsync(): Promise<NetWorthSnapshot[]> {
		const database = await this.getAuthorizedDatabaseAsync();

		const rows = await database
			.selectFrom(TableName)
			.selectAll()
			.orderBy("id", "asc")
			.execute();

		const netWorthSnapshots = rows.map((row) => {
			const netWorthSnapshotRow = netWorthSnapshotRowSchema.parse(row);
			return convertNetWorthSnapshotRowToNetWorthSnapshot(
				netWorthSnapshotRow,
			);
		});

		return netWorthSnapshots;
	}

	public async upsertNetWorthSnapshotsAsync(
		values: NetWorthSnapshot | NetWorthSnapshot[],
	): Promise<void> {
		const database = await this.getAuthorizedDatabaseAsync();

		const netWorthSnapshots = rowOrRowsAsRows(values).map((r) =>
			withoutId(convertNetWorthSnapshotToNetWorthSnapshotRow(r)),
		);

		await database
			.insertInto(TableName)
			.values(netWorthSnapshots)
			.onConflict((oc) =>
				oc.column("date").doUpdateSet((eb) => ({
					// eslint-disable-next-line @typescript-eslint/naming-convention
					value_cents: eb.ref("excluded.value_cents"),
				})),
			)
			.execute();
	}
}
