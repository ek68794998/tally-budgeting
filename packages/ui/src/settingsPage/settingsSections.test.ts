import { describe, expect, it } from "vitest";
import {
	isSettingsSectionId,
	sectionHasLocalSettings,
} from "./settingsSections";

describe("settingsSections", () => {
	it.each([
		{ expected: true, value: "data" },
		{ expected: true, value: "general" },
		{ expected: false, value: "nope" },
		{ expected: false, value: null },
	])("isSettingsSectionId($value) is $expected", ({ expected, value }) => {
		expect(isSettingsSectionId(value)).toBe(expected);
	});

	it.each([
		{ expected: true, id: "general" as const },
		{ expected: false, id: "providers" as const },
		{ expected: false, id: "data" as const },
	])("sectionHasLocalSettings($id) is $expected", ({ expected, id }) => {
		expect(sectionHasLocalSettings(id)).toBe(expected);
	});
});
