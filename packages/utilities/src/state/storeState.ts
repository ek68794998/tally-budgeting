export type StoreState<T extends object> = T & {
  error: string | null;
  fetch: () => Promise<void>;
  isFetching: boolean;
  isHydrated: boolean;
};
