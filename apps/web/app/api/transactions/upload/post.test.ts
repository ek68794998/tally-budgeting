import {
	buildAsset,
	buildSubcategory,
	buildTransactionRule,
} from "@tally/data-models/testing/fixtures";
import { getCsvRows } from "@tally/utilities/dataHandlers/csv";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../../testing/routeTesting";
import { PostTransactionsUploadRouteAsync } from "./post";

vi.mock(
	"../../../storage/assetsClient",
	async () =>
		(await import("../../testing/routeTesting")).storageModules.assets,
);
vi.mock(
	"../../../storage/subcategoriesClient",
	async () =>
		(await import("../../testing/routeTesting")).storageModules
			.subcategories,
);
vi.mock(
	"../../../storage/txnRulesClient",
	async () =>
		(await import("../../testing/routeTesting")).storageModules.txnRules,
);
vi.mock(
	"../../../storage/txnsClient",
	async () =>
		(await import("../../testing/routeTesting")).storageModules.txns,
);
vi.mock(
	"../../../auth/verifyRequest",
	async () =>
		(await import("../../testing/routeTesting")).authenticatedRequestModule,
);
vi.mock(
	"../../../telemetry/telemetry",
	async () =>
		(await import("../../testing/routeTesting")).silentTelemetryModule,
);

const chaseCsv = [
	"Transaction Date,Post Date,Description,Category,Type,Amount,Memo",
	"01/15/2025,01/16/2025,STARBUCKS 123,Food & Drink,Sale,-5.50,",
	"01/20/2025,01/20/2025,AUTOMATIC PAYMENT - THANK,,Payment,100.00,",
	"01/21/2025,01/21/2025,,Food & Drink,Sale,-1.00,",
].join("\n");

const csvRows = getCsvRows(chaseCsv);

const chaseAccount = buildAsset({
	id: 1,
	name: "Sapphire",
	provider: "chase",
	type: "short_term_liability",
});

const uploadAsync = (fields: Record<string, string | Blob>) => {
	const formData = new FormData();

	for (const [key, value] of Object.entries(fields)) {
		formData.set(key, value);
	}

	return callRouteAsync(PostTransactionsUploadRouteAsync, {
		formData,
		method: "POST",
	});
};

describe("PostTransactionsUploadRouteAsync", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storageMocks.assets.getAssetsAsync.mockResolvedValue([
			chaseAccount,
			buildAsset({ id: 2, name: "House", type: "fixed_asset" }),
			buildAsset({ id: 3, name: "Cash", provider: null }),
		]);
		storageMocks.subcategories.getSubcategoriesAsync.mockResolvedValue([
			buildSubcategory({ id: 7 }),
		]);
		storageMocks.txnRules.getTransactionRulesAsync.mockResolvedValue([
			buildTransactionRule({
				matcher: { flags: "i", pattern: "starbucks" },
				merchantName: "Starbucks",
				subcategoryId: 7,
			}),
		]);
	});

	it.each([
		{ isValidationOnly: "false", savedCount: 1 },
		{ isValidationOnly: "true", savedCount: 0 },
	])("sorts rows into processed, ignored, and failed (validation only: $isValidationOnly)", async ({
		isValidationOnly,
		savedCount,
	}) => {
		const { json, status } = await uploadAsync({
			accountId: "1",
			file: new File([chaseCsv], "chase.csv"),
			isValidationOnly,
		});

		expect(status).toBe(200);
		expect(json).toMatchObject({
			rowsFailed: [[expect.any(String), csvRows[2]]],
			rowsIgnored: [csvRows[1]],
			rowsProcessed: [
				{
					accountId: 1,
					amountCents: 550,
					merchant: "Starbucks",
					subcategoryId: 7,
				},
			],
			success: true,
		});
		expect(storageMocks.txns.insertTransactionsAsync).toHaveBeenCalledTimes(
			savedCount,
		);
	});

	it.each([
		{ accountId: "99", case: "an unknown account" },
		{ accountId: "3", case: "an account without a provider" },
		{ accountId: "2", case: "a non-account asset" },
	])("rejects $case", async ({ accountId }) => {
		const { json, status } = await uploadAsync({
			accountId,
			file: new File([chaseCsv], "chase.csv"),
			isValidationOnly: "true",
		});

		expect(status).toBe(400);
		expect(json).toMatchObject({ error: { code: "invalidAccount" } });
	});

	it("rejects a file that is not valid CSV", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);

		const { json, status } = await uploadAsync({
			accountId: "1",
			file: new File(['a,b\n"unterminated,1'], "bad.csv"),
			isValidationOnly: "true",
		});

		expect(status).toBe(400);
		expect(json).toMatchObject({ error: { code: "invalidFileUpload" } });
	});

	it("rejects form data missing the file", async () => {
		const { json, status } = await uploadAsync({
			accountId: "1",
			isValidationOnly: "true",
		});

		expect(status).toBe(400);
		expect(json).toMatchObject({ error: { code: "invalidRequestBody" } });
	});
});
