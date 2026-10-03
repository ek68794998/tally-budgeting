import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "./redirect";

describe("getSafeRedirectPath", () => {
	it.each([
		["/a", "/a"],
		["/assets?x=1#top", "/assets?x=1#top"],
		["//evil", "/"],
		["/\\evil", "/"],
		["https://evil", "/"],
		["", "/"],
		["javascript:alert(1)", "/"],
		["relative", "/"],
		[undefined, "/"],
		[42, "/"],
	])("maps %j to %j", (value, expected) => {
		expect(getSafeRedirectPath(value)).toBe(expected);
	});
});
