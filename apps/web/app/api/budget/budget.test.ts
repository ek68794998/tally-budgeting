import {
  buildSubcategory,
  buildTransaction,
} from "@tally/data-models/testing/fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../testing/routeTesting";
import { GetBudgetSpendingRouteAsync } from "./spending/get";
import { GetBudgetSummaryRouteAsync } from "./summary/get";

vi.mock(
  "../../storage/subcategoriesClient",
  async () =>
    (await import("../testing/routeTesting")).storageModules.subcategories,
);
vi.mock(
  "../../storage/txnsClient",
  async () => (await import("../testing/routeTesting")).storageModules.txns,
);
vi.mock(
  "../../auth/verifyRequest",
  async () =>
    (await import("../testing/routeTesting")).authenticatedRequestModule,
);
vi.mock(
  "../../telemetry/telemetry",
  async () => (await import("../testing/routeTesting")).silentTelemetryModule,
);

const { subcategories, txns } = storageMocks;

const getRequestedPeriod = () => {
  const [start, end] = txns.getTransactionsInPeriodAsync.mock.calls[0] ?? [];

  return [start?.toISO(), end?.toISO()];
};

describe("budget routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subcategories.getSubcategoriesAsync.mockResolvedValue([
      buildSubcategory({ id: 1, percentNeeds: 100 }),
    ]);
    txns.getTransactionsInPeriodAsync.mockResolvedValue([
      buildTransaction({ amountCents: 40_00, subcategoryId: 1 }),
    ]);
  });

  describe("GET spending", () => {
    it("summarizes spending for the whole days in the range", async () => {
      const { json, status } = await callRouteAsync(
        GetBudgetSpendingRouteAsync,
        {
          url: "http://localhost/api/budget/spending?startDate=2025-01-01&endDate=2025-01-31",
        },
      );

      expect(status).toBe(200);
      expect(json).toEqual({
        spending: [{ spentCents: 40_00, subcategoryId: 1 }],
        spentOnNeedsCents: 40_00,
        spentOnSavingsCents: 0,
        spentOnWantsCents: 0,
        success: true,
      });
      expect(getRequestedPeriod()).toEqual([
        expect.stringMatching(/^2025-01-01T00:00:00\.000/),
        expect.stringMatching(/^2025-01-31T23:59:59\.999/),
      ]);
    });

    it("rejects a date that passes the schema but is not a real date", async () => {
      const { json, status } = await callRouteAsync(
        GetBudgetSpendingRouteAsync,
        {
          url: "http://localhost/api/budget/spending?startDate=2025-01-01&endDate=2025-13-45",
        },
      );

      expect(status).toBe(400);
      expect(json).toMatchObject({
        error: { code: "invalidQueryParameters" },
      });
    });
  });

  describe("GET summary", () => {
    it("looks back 24 months from the end of the requested month", async () => {
      const { json, status } = await callRouteAsync(
        GetBudgetSummaryRouteAsync,
        {
          url: "http://localhost/api/budget/summary?endMonth=3&endYear=2025",
        },
      );

      expect(status).toBe(200);
      expect(json).toMatchObject({
        budgetBreakdown: [{ subcategoryId: 1 }],
      });
      expect(getRequestedPeriod()).toEqual([
        "2023-04-01T00:00:00.000Z",
        "2025-03-31T23:59:59.999Z",
      ]);
    });

    it("rejects an impossible month", async () => {
      const { json, status } = await callRouteAsync(
        GetBudgetSummaryRouteAsync,
        {
          url: "http://localhost/api/budget/summary?endMonth=13&endYear=2025",
        },
      );

      expect(status).toBe(400);
      expect(json).toMatchObject({
        error: { code: "invalidQueryParameters" },
      });
    });
  });
});
