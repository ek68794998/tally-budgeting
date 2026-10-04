import { addToast } from "@heroui/react";
import { getTransactionRuleFields } from "@tally/data-models/converters/transactionRule";
import {
  buildAsset,
  buildCategory,
  buildNetWorthSnapshot,
  buildSubcategory,
  buildTransaction,
  buildTransactionRule,
} from "@tally/data-models/testing/fixtures";
import { withoutId } from "@tally/utilities/object/withoutId";
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
import { usePutAsset } from "./usePutAsset";
import { usePutCategory } from "./usePutCategory";
import { usePutSubcategory } from "./usePutSubcategory";
import { usePutTransaction } from "./usePutTransaction";
import { usePutTransactionRule } from "./usePutTransactionRule";

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
  deleteAssetCase,
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
    expectedBody: { snapshot: withoutId(buildNetWorthSnapshot()) },
    expectedMethod: "POST",
    expectedUrl: "/api/net-worth/snapshots",
    name: "usePostNetWorthSnapshot",
    useMutate: () => {
      const { postSnapshotAsync } = usePostNetWorthSnapshot();
      return () => postSnapshotAsync(withoutId(buildNetWorthSnapshot()));
    },
  },
  {
    expectedBody: { asset: withoutId(buildAsset()) },
    expectedMethod: "POST",
    expectedUrl: "/api/assets",
    name: "usePostAsset",
    useMutate: () => {
      const { postAssetAsync } = usePostAsset();
      return () => postAssetAsync(withoutId(buildAsset()));
    },
  },
  {
    expectedBody: { category: withoutId(buildCategory()) },
    expectedMethod: "POST",
    expectedUrl: "/api/categories",
    name: "usePostCategory",
    useMutate: () => {
      const { postCategoryAsync } = usePostCategory();
      return () => postCategoryAsync(withoutId(buildCategory()));
    },
  },
  {
    expectedBody: { subcategory: withoutId(buildSubcategory()) },
    expectedMethod: "POST",
    expectedUrl: "/api/categories/sub",
    name: "usePostSubcategory",
    useMutate: () => {
      const { postSubcategoryAsync } = usePostSubcategory();
      return () => postSubcategoryAsync(withoutId(buildSubcategory()));
    },
  },
  {
    expectedBody: { transaction: withoutId(buildTransaction()) },
    expectedMethod: "POST",
    expectedUrl: "/api/transactions",
    name: "usePostTransaction",
    useMutate: () => {
      const { postTransactionAsync } = usePostTransaction();
      return () => postTransactionAsync(withoutId(buildTransaction()));
    },
  },
  {
    expectedBody: { rule: getTransactionRuleFields(buildTransactionRule()) },
    expectedMethod: "POST",
    expectedUrl: "/api/transactions/rules",
    name: "usePostTransactionRule",
    useMutate: () => {
      const { postTransactionRuleAsync } = usePostTransactionRule();
      return () =>
        postTransactionRuleAsync(
          getTransactionRuleFields(buildTransactionRule()),
        );
    },
  },
  {
    expectedBody: { asset: withoutId(buildAsset()) },
    expectedMethod: "PUT",
    expectedUrl: "/api/assets/4",
    name: "usePutAsset",
    useMutate: () => {
      const { putAssetAsync } = usePutAsset();
      return () => putAssetAsync(buildAsset({ id: 4 }));
    },
  },
  {
    expectedBody: { category: withoutId(buildCategory()) },
    expectedMethod: "PUT",
    expectedUrl: "/api/categories/4",
    name: "usePutCategory",
    useMutate: () => {
      const { putCategoryAsync } = usePutCategory();
      return () => putCategoryAsync(buildCategory({ id: 4 }));
    },
  },
  {
    expectedBody: { subcategory: withoutId(buildSubcategory()) },
    expectedMethod: "PUT",
    expectedUrl: "/api/categories/sub/4",
    name: "usePutSubcategory",
    useMutate: () => {
      const { putSubcategoryAsync } = usePutSubcategory();
      return () => putSubcategoryAsync(buildSubcategory({ id: 4 }));
    },
  },
  {
    expectedBody: { transaction: withoutId(buildTransaction()) },
    expectedMethod: "PUT",
    expectedUrl: "/api/transactions/4",
    name: "usePutTransaction",
    useMutate: () => {
      const { putTransactionAsync } = usePutTransaction();
      return () => putTransactionAsync(buildTransaction({ id: 4 }));
    },
  },
  {
    expectedBody: { rule: getTransactionRuleFields(buildTransactionRule()) },
    expectedMethod: "PUT",
    expectedUrl: "/api/transactions/rules/4",
    name: "usePutTransactionRule",
    useMutate: () => {
      const { putTransactionRuleAsync } = usePutTransactionRule();
      return () => putTransactionRuleAsync(buildTransactionRule({ id: 4 }));
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

  it.each(
    [...deleteCases, ...bodyCases].map((c) => [c.name, c] as const),
  )("%s returns false and toasts when the request fails", async (_name, mutationCase) => {
    const { mutationResult } = await mutateAsync(
      mutationCase,
      new Response(null, { status: 500 }),
    );

    expect(mutationResult).toBe(false);
    expect(addToast).toHaveBeenCalledOnce();
  });
});
