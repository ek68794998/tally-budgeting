import { type NetWorthSnapshot } from "../contracts/netWorthSnapshot";
import { type NetWorthSnapshotRow } from "../database/netWorthSnapshotRow";

export const convertNetWorthSnapshotRowToNetWorthSnapshot = (
	row: NetWorthSnapshotRow,
): NetWorthSnapshot => {
	const { date, id, value_cents: value } = row;

	return {
		date,
		id,
		valueCents: Number(value),
	};
};

export const convertNetWorthSnapshotToNetWorthSnapshotRow = (
	row: NetWorthSnapshot,
): NetWorthSnapshotRow => {
	const { date, id, valueCents } = row;

	return {
		date,
		id,
		value_cents: String(valueCents), // eslint-disable-line @typescript-eslint/naming-convention
	};
};
