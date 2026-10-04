import { toError } from "@ekumlin/typescript-toolkit/error";
import { getTransactionRulesResponseSchema } from "@tally/data-models/contracts/api/getTransactionRules";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { apiFetch } from "../routing/apiFetch";
import { api, buildApiRoute } from "../routing/routeBuilder";
import { telemetry } from "../telemetry/telemetry";
import { type StoreState } from "./storeState";

export type TransactionRuleStore = StoreState<{
  setTransactionRules: (transactionRules: TransactionRule[]) => void;
  transactionRules: TransactionRule[];
}>;

export const useTransactionRuleStore = create<TransactionRuleStore>()(
  subscribeWithSelector((set, _get) => ({
    error: null,
    fetch: async () => {
      set({
        isFetching: true,
      });

      try {
        const response = await apiFetch(
          buildApiRoute(api.transactions.rules.base),
        );
        const responseJson: unknown = await response.json();
        const { transactionRules } =
          getTransactionRulesResponseSchema.parse(responseJson);

        set({
          error: null,
          isFetching: false,
          isHydrated: true,
          transactionRules,
        });
      } catch (error) {
        telemetry().error("STORE_FETCH_FAILED", {
          errorMessage: toError(error).message,
          store: "transactionRule",
        });
        set({
          error: "Failed to fetch transactionRules",
          isFetching: false,
          isHydrated: true,
        });
      }
    },
    isFetching: false,
    isHydrated: false,
    setTransactionRules: (transactionRules) => set({ transactionRules }),
    transactionRules: [],
  })),
);
