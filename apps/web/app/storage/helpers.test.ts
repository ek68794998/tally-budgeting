import { describe, expect, it } from "vitest";
import {
	buildLikePattern,
	getOrderDirection,
	hasId,
	parseInValues,
	rowOrRowsAsRows,
	withoutId,
} from "./helpers";

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

	describe("buildLikePattern", () => {
		it.each([
			["coffee", "%coffee%"],
			["", "%%"],
			[123, "%123%"],
			["foo bar", "%foo bar%"],
		])("wraps %o in % wildcards → %s", (input, expected) => {
			expect(buildLikePattern(input)).toBe(expected);
		});
	});

	describe("getOrderDirection", () => {
		it.each([
			["ascending", "asc"],
			["descending", "desc"],
		] as const)("maps %s → %s", (input, expected) => {
			expect(getOrderDirection(input)).toBe(expected);
		});
	});

	describe("parseInValues", () => {
		it("splits a comma-separated string into an array", () => {
			expect(parseInValues("1,2,3")).toEqual(["1", "2", "3"]);
		});

		it("applies converter function to each value", () => {
			expect(parseInValues("1,2,3", Number)).toEqual([1, 2, 3]);
		});

		it("filters out null and undefined returned by converter", () => {
			const converter = (v: string) => (v === "skip" ? null : v);

			expect(parseInValues("a,skip,b", converter)).toEqual(["a", "b"]);
		});

		it("handles a single value", () => {
			expect(parseInValues("42")).toEqual(["42"]);
		});
	});

	describe("rowOrRowsAsRows", () => {
		it("wraps a single item in an array", () => {
			expect(rowOrRowsAsRows({ id: 1 })).toEqual([{ id: 1 }]);
		});

		it("returns an array unchanged", () => {
			expect(rowOrRowsAsRows([{ id: 1 }, { id: 2 }])).toEqual([
				{ id: 1 },
				{ id: 2 },
			]);
		});

		it("returns an empty array unchanged", () => {
			expect(rowOrRowsAsRows([])).toEqual([]);
		});
	});

	describe("withoutId", () => {
		it("removes the id field", () => {
			expect(withoutId({ id: 42, name: "test", value: 100 })).toEqual({
				name: "test",
				value: 100,
			});
		});

		it("returns an empty object when only id is present", () => {
			expect(withoutId({ id: 1 })).toEqual({});
		});
	});
});
