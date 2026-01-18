import { dangerouslyCoerceType } from "@tally/testing/dangerouslyCoerceType";
import { describe, expect, it } from "vitest";
import { type Asset } from "../contracts/asset";
import { isAccount, isAsset } from "./accountHelpers";

describe("data.accountHelpers", () => {
	describe("isAccount", () => {
		it.each([
			{ type: "liquid_asset" },
			{ type: "checking_account" },
			{ type: "savings_account" },
			{ type: "investment_account" },
		])("returns true for %o", (input) => {
			const asset = dangerouslyCoerceType<Asset>(input);
			expect(isAccount(asset)).toBe(true);
		});

		it.each([
			{ type: "fixed_asset" },
			{ type: "personal_asset" },
		])("returns false for %o", (input) => {
			const asset = dangerouslyCoerceType<Asset>(input);
			expect(isAccount(asset)).toBe(false);
		});
	});

	describe("isAsset", () => {
		it.each([
			{ type: "fixed_asset" },
			{ type: "liquid_asset" },
			{ type: "personal_asset" },
		])("returns true for %o", (input) => {
			const asset = dangerouslyCoerceType<Asset>(input);
			expect(isAsset(asset)).toBe(true);
		});

		it.each([
			{ type: "checking_account" },
			{ type: "savings_account" },
			{ type: "investment_account" },
			{ type: "other" },
			{ type: "" },
		])("returns false for %o", (input) => {
			const asset = dangerouslyCoerceType<Asset>(input);
			expect(isAsset(asset)).toBe(false);
		});
	});
});
