import { getNetWorthSnapshotsResponseSchema } from "@tally/data-models/contracts/api/getNetWorthSnapshots";
import { type NetWorthSnapshot } from "@tally/data-models/contracts/netWorthSnapshot";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface NetWorthSnapshotStore {
	error: string | null;
	fetchSnapshots: () => Promise<void>;
	isFetching: boolean;
	isHydrated: boolean;
	setSnapshots: (snapshots: NetWorthSnapshot[]) => void;
	snapshots: NetWorthSnapshot[];
}

export const useNetWorthSnapshotStore = create<NetWorthSnapshotStore>()(
	subscribeWithSelector((set, _get) => ({
		error: null,
		fetchSnapshots: async () => {
			set({
				isFetching: true,
			});

			try {
				const response = await fetch("/api/net-worth/snapshots");
				const responseJson: unknown = await response.json();
				const { snapshots } =
					getNetWorthSnapshotsResponseSchema.parse(responseJson);

				set({
					error: null,
					isFetching: false,
					isHydrated: true,
					snapshots,
				});
			} catch (_error) {
				// TODO
				set({
					error: "Failed to fetch snapshots",
					isFetching: false,
					isHydrated: true,
				});
			}
		},
		isFetching: false,
		isHydrated: false,
		setSnapshots: (snapshots) => set({ snapshots }),
		snapshots: [],
	})),
);
