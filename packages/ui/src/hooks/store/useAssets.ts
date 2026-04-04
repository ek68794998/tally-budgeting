"use client";

import { useAssetStore } from "@tally/utilities/state/asset";
import { useStoreState } from "./useStoreState";

export const useAssets = () => {
	const store = useAssetStore();
	const storeState = useStoreState(store);

	return {
		...storeState,
		assets: store.assets,
	};
};
