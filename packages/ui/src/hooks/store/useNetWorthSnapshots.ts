"use client";

import { useNetWorthSnapshotStore } from "@tally/utilities/state/netWorthSnapshot";
import { useEffect } from "react";

export const useNetWorthSnapshots = () => {
	const store = useNetWorthSnapshotStore();

	useEffect(() => {
		if (!store.isHydrated && !store.isFetching) {
			void store.fetchSnapshots();
		}
	}, [store]);

	return {
		error: store.error,
		isLoading: !store.isHydrated || store.isFetching,
		refetch: store.fetchSnapshots,
		snapshots: store.snapshots,
	};
};
