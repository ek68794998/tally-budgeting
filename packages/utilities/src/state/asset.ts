import { getAssetsResponseSchema } from "@tally/data-models/contracts/api/getAssets";
import { type Asset } from "@tally/data-models/contracts/asset";
import { create } from "zustand";

interface AssetStore {
	assets: Asset[];
	error: string | null;
	fetchAssets: () => Promise<void>;
	isFetching: boolean;
	isHydrated: boolean;
	setAssets: (assets: Asset[]) => void;
}

export const useAssetStore = create<AssetStore>((set, _get) => ({
	assets: [],
	error: null,
	fetchAssets: async () => {
		set({
			isFetching: true,
		});

		try {
			const response = await fetch("/api/assets");
			const responseJson: unknown = await response.json();
			const { assets } = getAssetsResponseSchema.parse(responseJson);

			set({
				assets,
				error: null,
				isFetching: false,
				isHydrated: true,
			});
		} catch (_error) {
			// TODO
			set({
				error: "Failed to fetch assets",
				isFetching: false,
				isHydrated: true,
			});
		}
	},
	isFetching: false,
	isHydrated: false,
	setAssets: (assets) => set({ assets }),
}));
