import { useDebounceFn } from "ahooks";
import { type DebounceOptions } from "ahooks/lib/useDebounce/debounceOptions";
import { useMemo } from "react";

type Callback = Parameters<typeof useDebounceFn>[0];

export const useDebounceCallback = <T extends Callback>(
	callback: T,
	options?: DebounceOptions,
) => {
	const { cancel, flush, run } = useDebounceFn(callback, options);

	const runTyped: T = run;

	return useMemo(
		() => ({
			cancel,
			flush,
			run: runTyped,
		}),
		[runTyped, cancel, flush],
	);
};
