"use client";

import { type StoreState } from "@tally/utilities/state/storeState";
import { useEffect } from "react";

export const useStoreState = <T extends object>(store: StoreState<T>) => {
  useEffect(() => {
    if (!store.isHydrated && !store.isFetching) {
      void store.fetch();
    }
  }, [store]);

  return {
    error: store.error,
    isLoading: !store.isHydrated || store.isFetching,
    refetch: store.fetch,
  };
};
