import { toError } from "@ekumlin/typescript-toolkit/error";
import { getNetWorthSnapshotsResponseSchema } from "@tally/data-models/contracts/api/getNetWorthSnapshots";
import { type NetWorthSnapshot } from "@tally/data-models/contracts/netWorthSnapshot";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { apiFetch } from "../routing/apiFetch";
import { api, buildApiRoute } from "../routing/routeBuilder";
import { telemetry } from "../telemetry/telemetry";
import { type StoreState } from "./storeState";

export type NetWorthSnapshotStore = StoreState<{
  setSnapshots: (snapshots: NetWorthSnapshot[]) => void;
  snapshots: NetWorthSnapshot[];
}>;

export const useNetWorthSnapshotStore = create<NetWorthSnapshotStore>()(
  subscribeWithSelector((set, _get) => ({
    error: null,
    fetch: async () => {
      set({
        isFetching: true,
      });

      try {
        const response = await apiFetch(buildApiRoute(api.netWorth.snapshots));
        const responseJson: unknown = await response.json();
        const { snapshots } =
          getNetWorthSnapshotsResponseSchema.parse(responseJson);

        set({
          error: null,
          isFetching: false,
          isHydrated: true,
          snapshots,
        });
      } catch (error) {
        telemetry().error("STORE_FETCH_FAILED", {
          errorMessage: toError(error).message,
          store: "netWorthSnapshot",
        });
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
