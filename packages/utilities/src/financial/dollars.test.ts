import { describe, expect, it } from "vitest";
import { Dollars } from "./dollars";

describe("Dollars", () => {
	describe("fromCents", () => {
		it.each([
			[100, 1.0],
			[0, 0.0],
			[1, 0.01],
			[50, 0.5],
			[99, 0.99],
			[1234, 12.34],
			[-100, -1.0],
			[-1, -0.01],
		])("should convert %i cents to $%f", (cents, expected) => {
			expect(Dollars.fromCents(cents)).toBe(expected);
		});

		it.each([
			["100", 1.0],
			["0", 0.0],
			["1", 0.01],
			["1234", 12.34],
			["-100", -1.0],
		])('should convert string "%s" cents to $%f', (cents, expected) => {
			expect(Dollars.fromCents(cents)).toBe(expected);
		});

		it.each([
			[100.4, 1.0],
			[100.5, 1.01],
			[100.6, 1.01],
			[99.5, 1.0],
			[-100.5, -1.0],
		])("should round %f cents to $%f", (cents, expected) => {
			expect(Dollars.fromCents(cents)).toBe(expected);
		});
	});

	describe("toCents", () => {
		it.each([
			[1.0, 100],
			[0.0, 0],
			[0.01, 1],
			[0.5, 50],
			[0.99, 99],
			[12.34, 1234],
			[-1.0, -100],
			[-0.01, -1],
		])("should convert $%f to %i cents", (dollars, expected) => {
			expect(Dollars.toCents(dollars)).toBe(expected);
		});

		it.each([
			["1.00", 100],
			["0", 0],
			["0.01", 1],
			["12.34", 1234],
			["-1.00", -100],
		])('should convert string "$%s" to %i cents', (dollars, expected) => {
			expect(Dollars.toCents(dollars)).toBe(expected);
		});

		it.each([
			[1.004, 100],
			[1.005, 100],
			[1.006, 101],
			[0.995, 100],
			[-1.005, -100],
		])("should round $%f to %i cents", (dollars, expected) => {
			expect(Dollars.toCents(dollars)).toBe(expected);
		});
	});

	describe("round-trip conversions", () => {
		it.each([
			[100],
			[0],
			[1],
			[1234],
			[99],
			[-100],
		])("should maintain value through fromCents -> toCents (%i)", (cents) => {
			expect(Dollars.toCents(Dollars.fromCents(cents))).toBe(cents);
		});

		it.each([
			[1.0],
			[0.0],
			[0.01],
			[12.34],
			[-1.0],
		])("should maintain value through toCents -> fromCents ($%f)", (dollars) => {
			expect(Dollars.fromCents(Dollars.toCents(dollars))).toBe(dollars);
		});
	});
});
