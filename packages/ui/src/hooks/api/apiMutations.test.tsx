import { addToast } from "@heroui/react";
import {
	buildAsset,
	buildCategory,
	buildNetWorthSnapshot,
	buildSubcategory,
	buildTransaction,
	buildTransactionRule,
} from "@tally/data-models/testing/fixtures";
import { act, renderHook } from "@testing-library/react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import { createQueryClientWrapper } from "../../testing/queryClient";
import { useDeleteAsset } from "./useDeleteAsset";
import { useDeleteCategory } from "./useDeleteCategory";
import { useDeleteSubcategory } from "./useDeleteSubcategory";
import { useDeleteTransaction } from "./useDeleteTransaction";
import { useDeleteTransactionRule } from "./useDeleteTransactionRule";
import { usePatchTransactionRulesReorder } from "./usePatchTransactionRulesReorder";
import { usePostAsset } from "./usePostAsset";
import { usePostCategory } from "./usePostCategory";
import { usePostNetWorthSnapshot } from "./usePostNetWorthSnapshot";
import { usePostSubcategory } from "./usePostSubcategory";
import { usePostTransaction } from "./usePostTransaction";
import { usePostTransactionRule } from "./usePostTransactionRule";

vi.mock("@heroui/react", () => ({
	addToast: vi.fn(),
}));

vi.mock("@tally/utilities/telemetry/telemetry", () => ({
	telemetry: () => ({ error: vi.fn() }),
}));

interface MutationCase {
	expectedBody?: unknown;
	expectedMethod: string;
	expectedUrl: string;
	name: string;
	useMutate: () => () => Promise<unknown>;
}

const deleteAssetCase: MutationCase = {
	expectedMethod: "DELETE",
	expectedUrl: "/api/assets/4",
	name: "useDeleteAsset",
	useMutate: () => {
		const { deleteAssetAsync } = useDeleteAsset();
		return () => deleteAssetAsync(4);
	},
};

const deleteCases: MutationCase[] = [
	{
		expectedMethod: "DELETE",
		expectedUrl: "/api/categories/4",
		name: "useDeleteCategory",
		useMutate: () => {
			const { deleteCategoryAsync } = useDeleteCategory();
			return () => deleteCategoryAsync(4);
		},
	},
	{
		expectedMethod: "DELETE",
		expectedUrl: "/api/categories/sub/4",
		name: "useDeleteSubcategory",
		useMutate: () => {
			const { deleteSubcategoryAsync } = useDeleteSubcategory();
			return () => deleteSubcategoryAsync(4);
		},
	},
	{
		expectedMethod: "DELETE",
		expectedUrl: "/api/transactions/4",
		name: "useDeleteTransaction",
		useMutate: () => {
			const { deleteTransactionAsync } = useDeleteTransaction();
			return () => deleteTransactionAsync(4);
		},
	},
	{
		expectedMethod: "DELETE",
		expectedUrl: "/api/transactions/rules/4",
		name: "useDeleteTransactionRule",
		useMutate: () => {
			const { deleteTransactionRuleAsync } = useDeleteTransactionRule();
			return () => deleteTransactionRuleAsync(4);
		},
	},
];

const bodyCases: MutationCase[] = [
	{
		expectedBody: { ruleIds: [3, 1] },
		expectedMethod: "PATCH",
		expectedUrl: "/api/transactions/rules/order",
		name: "usePatchTransactionRulesReorder",
		useMutate: () => {
			const { patchTransactionRulesReorderAsync } =
				usePatchTransactionRulesReorder();
			return () => patchTransactionRulesReorderAsync([3, 1]);
		},
	},
	{
		expectedBody: { asset: buildAsset() },
		expectedMethod: "POST",
		expectedUrl: "/api/assets",
		name: "usePostAsset",
		useMutate: () => {
			const { postAssetAsync } = usePostAsset();
			return () => postAssetAsync(buildAsset());
		},
	},
	{
		expectedBody: { category: buildCategory() },
		expectedMethod: "POST",
		expectedUrl: "/api/categories",
		name: "usePostCategory",
		useMutate: () => {
			const { postCategoryAsync } = usePostCategory();
			return () => postCategoryAsync(buildCategory());
		},
	},
	{
		expectedBody: { snapshot: buildNetWorthSnapshot() },
		expectedMethod: "POST",
		expectedUrl: "/api/net-worth/snapshots",
		name: "usePostNetWorthSnapshot",
		useMutate: () => {
			const { postSnapshotAsync } = usePostNetWorthSnapshot();
			return () => postSnapshotAsync(buildNetWorthSnapshot());
		},
	},
	{
		expectedBody: { subcategory: buildSubcategory() },
		expectedMethod: "POST",
		expectedUrl: "/api/categories/sub",
		name: "usePostSubcategory",
		useMutate: () => {
			const { postSubcategoryAsync } = usePostSubcategory();
			return () => postSubcategoryAsync(buildSubcategory());
		},
	},
	{
		expectedBody: { transaction: buildTransaction() },
		expectedMethod: "POST",
		expectedUrl: "/api/transactions",
		name: "usePostTransaction",
		useMutate: () => {
			const { postTransactionAsync } = usePostTransaction();
			return () => postTransactionAsync(buildTransaction());
		},
	},
	{
		expectedBody: { rule: buildTransactionRule() },
		expectedMethod: "POST",
		expectedUrl: "/api/transactions/rules",
		name: "usePostTransactionRule",
		useMutate: () => {
			const { postTransactionRuleAsync } = usePostTransactionRule();
			return () => postTransactionRuleAsync(buildTransactionRule());
		},
	},
];

const mutateAsync = async ({ useMutate }: MutationCase, response: Response) => {
	const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(response));
	vi.stubGlobal("fetch", fetchMock);

	const { wrapper } = createQueryClientWrapper();
	const { result } = renderHook(useMutate, {
		wrapper,
	});

	let mutationResult: unknown;

	await act(async () => {
		mutationResult = await result.current();
	});

	return { fetchMock, mutationResult };
};

const getRequestInit = (fetchMock: Mock<typeof fetch>) => {
	const [url, init] = fetchMock.mock.calls[0] ?? [];
	const body: unknown =
		typeof init?.body === "string" ? JSON.parse(init.body) : undefined;

	return { body, method: init?.method, url };
};

describe("API mutation hooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it.each(
		bodyCases.map((c) => [c.name, c] as const),
	)("%s sends the request and returns the validated response", async (_name, mutationCase) => {
		const { fetchMock, mutationResult } = await mutateAsync(
			mutationCase,
			new Response(JSON.stringify({ success: true }), { status: 200 }),
		);

		expect(getRequestInit(fetchMock)).toEqual({
			body: mutationCase.expectedBody,
			method: mutationCase.expectedMethod,
			url: mutationCase.expectedUrl,
		});
		expect(mutationResult).not.toBe(false);
		expect(addToast).not.toHaveBeenCalled();
	});

	it.each(
		deleteCases.map((c) => [c.name, c] as const),
	)("%s accepts the empty 204 the API returns", async (_name, mutationCase) => {
		const { fetchMock, mutationResult } = await mutateAsync(
			mutationCase,
			new Response(null, { status: 204 }),
		);

		expect(getRequestInit(fetchMock)).toEqual({
			body: undefined,
			method: mutationCase.expectedMethod,
			url: mutationCase.expectedUrl,
		});
		expect(mutationResult).not.toBe(false);
		expect(addToast).not.toHaveBeenCalled();
	});

	// Known bug: `useDeleteAsset` validates with `z.object({})`, which rejects the API's empty 204 body.
	it.fails("useDeleteAsset accepts the empty 204 the API returns", async () => {
		const { mutationResult } = await mutateAsync(
			deleteAssetCase,
			new Response(null, { status: 204 }),
		);

		expect(mutationResult).not.toBe(false);
	});

	it.each(
		[deleteAssetCase, ...deleteCases, ...bodyCases].map(
			(c) => [c.name, c] as const,
		),
	)("%s returns false and toasts when the request fails", async (_name, mutationCase) => {
		const { mutationResult } = await mutateAsync(
			mutationCase,
			new Response(null, { status: 500 }),
		);

		expect(mutationResult).toBe(false);
		expect(addToast).toHaveBeenCalledOnce();
	});
});
