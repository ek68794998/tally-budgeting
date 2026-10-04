import { toError } from "@ekumlin/typescript-toolkit/error";
import { getAssetsResponseSchema } from "@tally/data-models/contracts/api/getAssets";
import { type Asset } from "@tally/data-models/contracts/asset";
import { create } from "zustand";
import { apiFetch } from "../routing/apiFetch";
import { api, buildApiRoute } from "../routing/routeBuilder";
import { telemetry } from "../telemetry/telemetry";
import { type StoreState } from "./storeState";

export type AssetStore = StoreState<{
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
}>;

export const useAssetStore = create<AssetStore>((set, _get) => ({
  assets: [],
  error: null,
  fetch: async () => {
    set({
      isFetching: true,
    });

    try {
      const response = await apiFetch(buildApiRoute(api.assets));
      const responseJson: unknown = await response.json();
      const { assets } = getAssetsResponseSchema.parse(responseJson);

      set({
        assets,
        error: null,
        isFetching: false,
        isHydrated: true,
      });
    } catch (error) {
      telemetry().error("STORE_FETCH_FAILED", {
        errorMessage: toError(error).message,
        store: "asset",
      });
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
