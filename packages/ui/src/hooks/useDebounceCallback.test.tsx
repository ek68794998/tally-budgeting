import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounceCallback } from "./useDebounceCallback";

describe("useDebounceCallback", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("runs the callback once after the wait, with the latest arguments", () => {
		const callback = vi.fn((_value: string) => undefined);
		const { result } = renderHook(() =>
			useDebounceCallback(callback, { wait: 100 }),
		);

		act(() => {
			result.current.run("a");
			result.current.run("b");
		});

		expect(callback).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(100);
		});

		expect(callback).toHaveBeenCalledExactlyOnceWith("b");
	});

	it.each([
		{ action: "flush", expectedCalls: 1 },
		{ action: "cancel", expectedCalls: 0 },
	] as const)("supports $action", ({ action, expectedCalls }) => {
		const callback = vi.fn();
		const { result } = renderHook(() =>
			useDebounceCallback(callback, { wait: 100 }),
		);

		act(() => {
			result.current.run();
			result.current[action]();
			vi.advanceTimersByTime(100);
		});

		expect(callback).toHaveBeenCalledTimes(expectedCalls);
	});
});
