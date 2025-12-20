"use client";

import { useAssetStore } from "@tally/utilities/state/asset";
import { useEffect } from "react";

export const useAssets = () => {
	const store = useAssetStore();

	useEffect(() => {
		if (!store.isHydrated && !store.isFetching) {
			void store.fetchAssets();
		}
	}, [store]);

	return {
		assets: store.assets,
		error: store.error,
		isLoading: !store.isHydrated || store.isFetching,
		refetch: store.fetchAssets,
	};
};
