import { describe, expect, it } from "vitest";
import { scaleToFit } from "./scaleToFit";

describe("scaleToFit", () => {
	it.each([
		{
			container: { height: 100, width: 100 },
			expected: { height: 100, scale: 2, width: 100 },
			object: { height: 50, width: 50 },
		},
		{
			container: { height: 100, width: 100 },
			expected: { height: 100, scale: 0.5, width: 100 },
			object: { height: 200, width: 200 },
		},
		{
			container: { height: 50, width: 100 },
			expected: { height: 50, scale: 0.5, width: 50 },
			object: { height: 100, width: 100 },
		},
		{
			container: { height: 100, width: 200 },
			expected: { height: 100, scale: 1, width: 100 },
			object: { height: 100, width: 100 },
		},
		{
			container: { height: 1080, width: 1920 },
			expected: { height: 1080, scale: 1.5, width: 1920 },
			object: { height: 720, width: 1280 },
		},
		{
			container: { height: 600, width: 800 },
			expected: { height: 450, scale: 800 / 1920, width: 800 },
			object: { height: 1080, width: 1920 },
		},
	])("scales $object.width×$object.height to fit $container.width×$container.height", ({
		container,
		expected,
		object,
	}) => {
		expect(scaleToFit(container, object)).toEqual(expected);
	});
});
