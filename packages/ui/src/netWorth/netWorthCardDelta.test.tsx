import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NetWorthCardDelta } from "./netWorthCardDelta";

describe("NetWorthCardDelta", () => {
	it.each([
		{ current: 150, expectedClass: "text-success-600" },
		{ current: 50, expectedClass: "text-danger-600" },
		{ current: 100, expectedClass: "opacity-70" },
	])("colors a change to $current as $expectedClass", ({
		current,
		expectedClass,
	}) => {
		render(
			<NetWorthCardDelta
				currentDollars={current}
				previousDateIso="2025-01-15T12:00:00.000Z"
				previousDollars={100}
			/>,
		);

		expect(screen.getByText(/ since January 15$/u)).toHaveClass(
			expectedClass,
		);
	});
});
