import { describe, expect, it } from "vitest";
import { convertAssetRowToAsset, convertAssetToAssetRow } from "./asset";

describe("asset converters", () => {
	describe("convertAssetRowToAsset", () => {
		it("converts a row to an asset, coercing value_cents to number", () => {
			const result = convertAssetRowToAsset({
				active: true,
				id: 1,
				name: "Checking Account",
				provider: "chase",
				type: "liquid_asset",
				value_cents: "150000", // eslint-disable-line @typescript-eslint/naming-convention
			});

			expect(result).toEqual({
				active: true,
				id: 1,
				name: "Checking Account",
				provider: "chase",
				type: "liquid_asset",
				valueCents: 150000,
			});
		});

		it("preserves null provider", () => {
			const result = convertAssetRowToAsset({
				active: false,
				id: 2,
				name: "Manual Asset",
				provider: null,
				type: "fixed_asset",
				value_cents: "0", // eslint-disable-line @typescript-eslint/naming-convention
			});

			expect(result.provider).toBeNull();
			expect(result.valueCents).toBe(0);
		});

		it.each([
			["small value", "1", 1],
			["zero", "0", 0],
			["large value", "999999999", 999999999],
			["negative value", "-50000", -50000],
		])("coerces %s correctly (%s → %d)", (_label, valueStr, expected) => {
			const result = convertAssetRowToAsset({
				active: true,
				id: 1,
				name: "Test",
				provider: null,
				type: "liquid_asset",
				value_cents: valueStr, // eslint-disable-line @typescript-eslint/naming-convention
			});

			expect(result.valueCents).toBe(expected);
		});
	});

	describe("convertAssetToAssetRow", () => {
		it("converts an asset to a row, stringifying valueCents", () => {
			const result = convertAssetToAssetRow({
				active: true,
				id: 1,
				name: "Checking Account",
				provider: "chase",
				type: "liquid_asset",
				valueCents: 150000,
			});

			expect(result).toEqual({
				active: true,
				id: 1,
				name: "Checking Account",
				provider: "chase",
				type: "liquid_asset",
				value_cents: "150000", // eslint-disable-line @typescript-eslint/naming-convention
			});
		});

		it("preserves null provider", () => {
			const result = convertAssetToAssetRow({
				active: false,
				id: 2,
				name: "Manual Asset",
				provider: null,
				type: "fixed_asset",
				valueCents: 0,
			});

			expect(result.provider).toBeNull();
			expect(result.value_cents).toBe("0");
		});
	});

	describe("round-trip", () => {
		it.each([
			{
				active: true,
				id: 1,
				name: "Apple Card",
				provider: "apple" as const,
				type: "short_term_liability" as const,
				valueCents: 5000,
			},
			{
				active: false,
				id: 99,
				name: "Robinhood",
				provider: "robinhood" as const,
				type: "fixed_asset" as const,
				valueCents: 0,
			},
		])("asset → row → asset is identity for %o", (asset) => {
			const row = convertAssetToAssetRow(asset);
			const result = convertAssetRowToAsset(row);

			expect(result).toEqual(asset);
		});
	});
});
