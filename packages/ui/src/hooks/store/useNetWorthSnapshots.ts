"use client";

import { useNetWorthSnapshotStore } from "@tally/utilities/state/netWorthSnapshot";
import { useStoreState } from "./useStoreState";

export const useNetWorthSnapshots = () => {
  const store = useNetWorthSnapshotStore();
  const storeState = useStoreState(store);

  return {
    ...storeState,
    snapshots: store.snapshots,
  };
};
