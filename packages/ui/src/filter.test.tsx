import { describe, expect, it } from "vitest";
import { filterMatches } from "./filter";

describe("filterMatches", () => {
	it.each([
		// Empty filter cases
		["", "anything", true],
		["", "", true],

		// Exact matches
		["hello", "hello", true],
		["HELLO", "hello", true],
		["hello", "HELLO", true],

		// Partial matches
		["ell", "hello", true],
		["lo", "hello", true],
		["h", "hello", true],

		// Non-matches
		["world", "hello", false],
		["x", "hello", false],
		["hello!", "hello", false],

		// Case insensitive
		["HeLLo", "hello world", true],
		["WORLD", "hello world", true],

		// Whitespace
		["hello world", "hello world", true],
		["lo wo", "hello world", true],
		[" ", "hello world", true],
	])('filterMatches("%s", "%s") returns %s', (filter, value, expected) => {
		expect(filterMatches(filter, value)).toBe(expected);
	});
});
