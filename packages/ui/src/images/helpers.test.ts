import { describe, expect, it } from "vitest";
import { getScaledLogoSize } from "./helpers";

describe("getScaledLogoSize", () => {
	it.each([
		{ container: [undefined, undefined], expected: null },
		{ container: [50, undefined], expected: [50, 25] },
		{ container: [undefined, 10], expected: [20, 10] },
		{ container: [100, 10], expected: [20, 10] },
	] as const)("scales a 200x100 logo into $container", ({
		container: [width, height],
		expected,
	}) => {
		expect(getScaledLogoSize(200, 100, width, height)).toEqual(expected);
	});
});
