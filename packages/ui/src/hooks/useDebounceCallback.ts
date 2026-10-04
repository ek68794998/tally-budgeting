import { useDebounceFn } from "ahooks";
import { type DebounceOptions } from "ahooks/lib/useDebounce/debounceOptions";
import { useMemo } from "react";

type Callback = Parameters<typeof useDebounceFn>[0];

export const useDebounceCallback = <T extends Callback>(
  callback: T,
  options?: DebounceOptions,
) => {
  const { cancel, flush, ...rest } = useDebounceFn(callback, options);

  // Because of how `lodash` is imported, there is no type-safety
  // for the `run` function, requiring us to use type coercion.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const runTyped: T = rest.run;

  return useMemo(
    () => ({
      cancel,
      flush,
      run: runTyped,
    }),
    [runTyped, cancel, flush],
  );
};
