import { describe, expect, it, vi } from "vitest";
import { parseSettingValue } from "./parseSettingValue";

describe("parseSettingValue", () => {
	it.each([
		{ expected: "dark", failed: false, key: "displayTheme", raw: "dark" },
		{ expected: "system", failed: true, key: "displayTheme", raw: "pink" },
		{ expected: "system", failed: true, key: "displayTheme", raw: 3 },
		{
			expected: "system",
			failed: false,
			key: "displayTheme",
			raw: undefined,
		},
		{
			expected: ["chase"],
			failed: false,
			key: "providersHidden",
			raw: ["chase"],
		},
		{
			expected: [],
			failed: true,
			key: "providersHidden",
			raw: ["notAProvider"],
		},
		{ expected: [], failed: true, key: "providersHidden", raw: "chase" },
		{
			expected: [],
			failed: false,
			key: "providersHidden",
			raw: undefined,
		},
	] as const)("returns $expected for $key given $raw", ({
		expected,
		failed,
		key,
		raw,
	}) => {
		const onParseFailed = vi.fn();

		expect(parseSettingValue(key, raw, onParseFailed)).toEqual(expected);
		expect(onParseFailed).toHaveBeenCalledTimes(failed ? 1 : 0);
	});
});
