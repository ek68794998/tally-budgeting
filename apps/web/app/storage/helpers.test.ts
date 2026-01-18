import { describe, expect, it } from "vitest";
import { hasId } from "./helpers";

describe("storage.helpers", () => {
	describe("hasId", () => {
		it.each([
			{ id: 1 },
			{ id: 2 },
			{ id: 100 },
			{ id: -1 },
			{ id: -2 },
			{ id: -100 },
		])("returns true for %o", (value) => {
			expect(hasId(value)).toBe(true);
		});

		it.each([
			{ id: 0 },
			{ id: undefined },
			{ id: null },
			{ id: "1" },
			{ id: true },
			{ id: {} },
			{},
			{ name: "test" },
			null,
			undefined,
			123,
			"string",
			true,
		])("returns false for %o", (value) => {
			expect(hasId(value)).toBe(false);
		});
	});
});
