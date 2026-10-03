import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AssetsTableControls } from "./assetsTableControls";

describe("AssetsTableControls", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("debounces filter changes, clears the filter, and adds an asset", () => {
		const onFilterChange = vi.fn();
		const onNewAsset = vi.fn();

		render(
			<AssetsTableControls
				onFilterChange={onFilterChange}
				onNewAsset={onNewAsset}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText("Search"), {
			target: { value: "house" },
		});
		act(() => {
			vi.advanceTimersByTime(500);
		});

		expect(onFilterChange).toHaveBeenLastCalledWith("house");

		fireEvent.click(screen.getByLabelText("clear input"));
		act(() => {
			vi.advanceTimersByTime(500);
		});
		fireEvent.click(screen.getByText("New Asset"));

		expect(onFilterChange).toHaveBeenLastCalledWith("");
		expect(onNewAsset).toHaveBeenCalledOnce();
	});
});
