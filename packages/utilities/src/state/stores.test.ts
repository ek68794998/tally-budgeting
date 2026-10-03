import {
	buildAsset,
	buildCategory,
	buildNetWorthSnapshot,
	buildSubcategory,
	buildTransactionRule,
} from "@tally/data-models/testing/fixtures";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { telemetry } from "../telemetry/telemetry";
import { useAssetStore } from "./asset";
import { useCategoryStore } from "./category";
import { useNetWorthSnapshotStore } from "./netWorthSnapshot";
import { useTransactionRuleStore } from "./transactionRule";

vi.mock("../telemetry/telemetry", () => {
	const logger = { error: vi.fn() };
	return { telemetry: () => logger };
});

interface StoreCase {
	expectedError: string;
	expectedUrl: string;
	getState: () => {
		error: string | null;
		fetch: () => Promise<void>;
		isFetching: boolean;
		isHydrated: boolean;
	};
	getValues: () => unknown;
	name: string;
	reset: () => void;
	responseBody: Record<string, unknown>;
	setValues: () => void;
	storeName: string;
}

const assets = [buildAsset()];
const categories = [buildCategory()];
const subcategories = [buildSubcategory()];
const snapshots = [buildNetWorthSnapshot()];
const transactionRules = [buildTransactionRule()];

const initialFlags = { error: null, isFetching: false, isHydrated: false };

const storeCases: StoreCase[] = [
	{
		expectedError: "Failed to fetch assets",
		expectedUrl: "/api/assets",
		getState: useAssetStore.getState,
		getValues: () => ({ assets: useAssetStore.getState().assets }),
		name: "useAssetStore",
		reset: () => useAssetStore.setState({ ...initialFlags, assets: [] }),
		responseBody: { assets },
		setValues: () => useAssetStore.getState().setAssets(assets),
		storeName: "asset",
	},
	{
		expectedError: "Failed to fetch categories",
		expectedUrl: "/api/categories",
		getState: useCategoryStore.getState,
		getValues: () => {
			const state = useCategoryStore.getState();
			return {
				categories: state.categories,
				subcategories: state.subcategories,
			};
		},
		name: "useCategoryStore",
		reset: () =>
			useCategoryStore.setState({
				...initialFlags,
				categories: [],
				subcategories: [],
			}),
		responseBody: { categories, subcategories },
		setValues: () => {
			useCategoryStore.getState().setCategories(categories);
			useCategoryStore.setState({ subcategories });
		},
		storeName: "category",
	},
	{
		expectedError: "Failed to fetch snapshots",
		expectedUrl: "/api/net-worth/snapshots",
		getState: useNetWorthSnapshotStore.getState,
		getValues: () => ({
			snapshots: useNetWorthSnapshotStore.getState().snapshots,
		}),
		name: "useNetWorthSnapshotStore",
		reset: () =>
			useNetWorthSnapshotStore.setState({
				...initialFlags,
				snapshots: [],
			}),
		responseBody: { snapshots },
		setValues: () =>
			useNetWorthSnapshotStore.getState().setSnapshots(snapshots),
		storeName: "netWorthSnapshot",
	},
	{
		expectedError: "Failed to fetch transactionRules",
		expectedUrl: "/api/transactions/rules",
		getState: useTransactionRuleStore.getState,
		getValues: () => ({
			transactionRules:
				useTransactionRuleStore.getState().transactionRules,
		}),
		name: "useTransactionRuleStore",
		reset: () =>
			useTransactionRuleStore.setState({
				...initialFlags,
				transactionRules: [],
			}),
		responseBody: { transactionRules },
		setValues: () =>
			useTransactionRuleStore
				.getState()
				.setTransactionRules(transactionRules),
		storeName: "transactionRule",
	},
];

const cases = storeCases.map(
	(storeCase) => [storeCase.name, storeCase] as const,
);

describe("data stores", () => {
	beforeEach(() => {
		for (const { reset } of storeCases) {
			reset();
		}
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it.each(cases)("%s hydrates from the API", async (_name, storeCase) => {
		const fetchMock = vi.fn<typeof fetch>(() =>
			Promise.resolve(
				new Response(
					JSON.stringify({
						...storeCase.responseBody,
						success: true,
					}),
				),
			),
		);
		vi.stubGlobal("fetch", fetchMock);

		const fetchPromise = storeCase.getState().fetch();

		expect(storeCase.getState().isFetching).toBe(true);

		await fetchPromise;

		expect(fetchMock.mock.calls[0]?.[0]).toBe(storeCase.expectedUrl);
		expect(storeCase.getValues()).toEqual(storeCase.responseBody);
		expect(storeCase.getState()).toMatchObject({
			error: null,
			isFetching: false,
			isHydrated: true,
		});
	});

	it.each(
		cases,
	)("%s records an error when the response is invalid", async (_name, storeCase) => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() => Promise.resolve(new Response(JSON.stringify({})))),
		);

		await storeCase.getState().fetch();

		expect(storeCase.getState()).toMatchObject({
			error: storeCase.expectedError,
			isFetching: false,
			isHydrated: true,
		});
		const [eventName, data] =
			vi.mocked(telemetry().error).mock.lastCall ?? [];

		expect(eventName).toBe("STORE_FETCH_FAILED");
		expect(data).toMatchObject({ store: storeCase.storeName });
	});

	it.each(
		cases,
	)("%s exposes a setter for local updates", (_name, storeCase) => {
		storeCase.setValues();

		expect(storeCase.getValues()).toEqual(storeCase.responseBody);
	});
});
