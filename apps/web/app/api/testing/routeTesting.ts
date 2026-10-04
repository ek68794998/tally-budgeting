import { isUndefined } from "@ekumlin/typescript-toolkit/types";
import { NextRequest } from "next/server";
import { vi } from "vitest";
import { type AssetsClient } from "../../storage/assetsClient";
import { type CategoriesClient } from "../../storage/categoriesClient";
import { type DatabaseAdminClient } from "../../storage/databaseAdminClient";
import { type NetWorthSnapshotsClient } from "../../storage/netWorthSnapshotsClient";
import { type SettingsClient } from "../../storage/settingsClient";
import { type SubcategoriesClient } from "../../storage/subcategoriesClient";
import { type TxnRulesClient } from "../../storage/txnRulesClient";
import { type TxnsClient } from "../../storage/txnsClient";
import { type NextResponseFn } from "../types";

interface RouteCall {
	body?: unknown;
	formData?: FormData;
	headers?: [string, string][];
	method?: string;
	params?: Record<string, string>;
	url?: string;
}

export const callRouteAsync = async (
	route: NextResponseFn,
	{
		body,
		formData,
		headers = [],
		method = "GET",
		params = {},
		url = "http://localhost/api/test",
	}: RouteCall = {},
) => {
	const request = new NextRequest(url, {
		body:
			formData ?? (isUndefined(body) ? undefined : JSON.stringify(body)),
		headers: [["host", "localhost"], ...headers],
		method,
	});

	const response = await route(request, { params: Promise.resolve(params) });
	const text = await response.text();
	const json: unknown = text ? JSON.parse(text) : null;

	return { json, status: response.status };
};

const createMockClass = (mock: object) =>
	class {
		public constructor() {
			Object.assign(this, mock);
		}
	};

export const storageMocks = {
	assets: {
		deleteAssetAsync: vi.fn<AssetsClient["deleteAssetAsync"]>(),
		getAssetsAsync: vi.fn<AssetsClient["getAssetsAsync"]>(),
		insertAssetsAsync: vi.fn<AssetsClient["insertAssetsAsync"]>(),
		updateAssetAsync: vi.fn<AssetsClient["updateAssetAsync"]>(),
	},
	categories: {
		deleteCategoryAsync: vi.fn<CategoriesClient["deleteCategoryAsync"]>(),
		getCategoriesAsync: vi.fn<CategoriesClient["getCategoriesAsync"]>(),
		insertCategoriesAsync:
			vi.fn<CategoriesClient["insertCategoriesAsync"]>(),
		updateCategoryAsync: vi.fn<CategoriesClient["updateCategoryAsync"]>(),
	},
	databaseAdmin: {
		dropAllDataAsync: vi.fn<DatabaseAdminClient["dropAllDataAsync"]>(),
		restoreAsync: vi.fn<DatabaseAdminClient["restoreAsync"]>(),
	},
	netWorthSnapshots: {
		getNetWorthSnapshotsAsync:
			vi.fn<NetWorthSnapshotsClient["getNetWorthSnapshotsAsync"]>(),
		upsertNetWorthSnapshotsAsync:
			vi.fn<NetWorthSnapshotsClient["upsertNetWorthSnapshotsAsync"]>(),
	},
	settings: {
		getSettingsAsync: vi.fn<SettingsClient["getSettingsAsync"]>(),
		putSettingAsync: vi.fn<SettingsClient["putSettingAsync"]>(),
	},
	subcategories: {
		deleteSubcategoryAsync:
			vi.fn<SubcategoriesClient["deleteSubcategoryAsync"]>(),
		getSubcategoriesAsync:
			vi.fn<SubcategoriesClient["getSubcategoriesAsync"]>(),
		insertSubcategoriesAsync:
			vi.fn<SubcategoriesClient["insertSubcategoriesAsync"]>(),
		updateSubcategoryAsync:
			vi.fn<SubcategoriesClient["updateSubcategoryAsync"]>(),
	},
	txnRules: {
		deleteTransactionRuleAsync:
			vi.fn<TxnRulesClient["deleteTransactionRuleAsync"]>(),
		getTransactionRulesAsync:
			vi.fn<TxnRulesClient["getTransactionRulesAsync"]>(),
		insertTransactionRulesAsync:
			vi.fn<TxnRulesClient["insertTransactionRulesAsync"]>(),
		updateTransactionRuleAsync:
			vi.fn<TxnRulesClient["updateTransactionRuleAsync"]>(),
		updateTransactionRulesOrderAsync:
			vi.fn<TxnRulesClient["updateTransactionRulesOrderAsync"]>(),
	},
	txns: {
		deleteTransactionAsync: vi.fn<TxnsClient["deleteTransactionAsync"]>(),
		getTransactionsAsync: vi.fn<TxnsClient["getTransactionsAsync"]>(),
		getTransactionsInPeriodAsync:
			vi.fn<TxnsClient["getTransactionsInPeriodAsync"]>(),
		insertTransactionsAsync: vi.fn<TxnsClient["insertTransactionsAsync"]>(),
		updateTransactionAsync: vi.fn<TxnsClient["updateTransactionAsync"]>(),
	},
};

const createMockModule = (exportName: string, mock: object) => ({
	[exportName]: createMockClass(mock),
});

// Module shapes for `vi.mock` factories, e.g.
// `vi.mock("../../storage/assetsClient", async () => (await import("../testing/routeTesting")).storageModules.assets)`.
export const storageModules = {
	assets: createMockModule("AssetsClient", storageMocks.assets),
	categories: createMockModule("CategoriesClient", storageMocks.categories),
	databaseAdmin: createMockModule(
		"DatabaseAdminClient",
		storageMocks.databaseAdmin,
	),
	netWorthSnapshots: createMockModule(
		"NetWorthSnapshotsClient",
		storageMocks.netWorthSnapshots,
	),
	settings: createMockModule("SettingsClient", storageMocks.settings),
	subcategories: createMockModule(
		"SubcategoriesClient",
		storageMocks.subcategories,
	),
	txnRules: createMockModule("TxnRulesClient", storageMocks.txnRules),
	txns: createMockModule("TxnsClient", storageMocks.txns),
};

export const authenticatedRequestModule = {
	isAuthenticatedAsync: () => Promise.resolve(true),
};

export const telemetryLogger = {
	error: vi.fn(),
	event: vi.fn(),
	httpIncoming: () => ({ end: vi.fn() }),
	info: vi.fn(),
	profile: () => ({ end: vi.fn() }),
	warn: vi.fn(),
};

export const silentTelemetryModule = {
	telemetry: () => telemetryLogger,
};
