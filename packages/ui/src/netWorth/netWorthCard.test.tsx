import { dangerouslyMockPartial } from "@ekumlin/typescript-toolkit/testing";
import { addToast } from "@heroui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePostNetWorthSnapshot } from "../hooks/api/usePostNetWorthSnapshot";
import { useNetWorthSnapshots } from "../hooks/store/useNetWorthSnapshots";
import { NetWorthCard } from "./netWorthCard";
import { NetWorthCardDelta } from "./netWorthCardDelta";
import { NetWorthOverTimeCard } from "./netWorthOverTimeCard";

vi.mock("@heroui/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@heroui/react")>()),
  addToast: vi.fn(),
}));
vi.mock("../hooks/api/usePostNetWorthSnapshot", () => ({
  usePostNetWorthSnapshot: vi.fn(),
}));
vi.mock("../hooks/store/useNetWorthSnapshots", () => ({
  useNetWorthSnapshots: vi.fn(),
}));
vi.mock("./netWorthCardDelta", () => ({
  NetWorthCardDelta: vi.fn(() => <div data-testid="delta" />),
}));
vi.mock("./netWorthOverTimeCard", () => ({
  NetWorthOverTimeCard: vi.fn(() => <div data-testid="over-time" />),
}));

const now = "2025-04-10T12:00:00.000Z";
const postSnapshotAsync = vi.fn();
const refetch = vi.fn(() => Promise.resolve());

const snapshots = [
  { date: "2025-03-01T12:00:00.000Z", valueCents: 900_00 },
  { date: "not a date", valueCents: 1 },
  { date: "2025-04-10T12:00:00.000Z", valueCents: 2 },
  { date: "2025-02-01T12:00:00.000Z", valueCents: 800_00 },
];

describe("NetWorthCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ now: new Date(now), toFake: ["Date"] });
    vi.mocked(useNetWorthSnapshots).mockReturnValue(
      dangerouslyMockPartial<ReturnType<typeof useNetWorthSnapshots>>({
        refetch,
      }),
    );
    vi.mocked(usePostNetWorthSnapshot).mockReturnValue(
      dangerouslyMockPartial<ReturnType<typeof usePostNetWorthSnapshot>>({
        postSnapshotAsync,
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("charts past snapshots plus today and compares with the latest one", () => {
    render(<NetWorthCard netWorth={1000} snapshots={snapshots} />);

    expect(screen.getByText("$1,000")).toBeInTheDocument();
    expect(vi.mocked(NetWorthCardDelta).mock.lastCall?.[0]).toEqual({
      currentDollars: 1000,
      previousDateIso: "2025-03-01T12:00:00.000Z",
      previousDollars: 900,
    });
    expect(vi.mocked(NetWorthOverTimeCard).mock.lastCall?.[0].data).toEqual([
      snapshots[3],
      snapshots[0],
      { date: now, valueCents: 1000_00 },
    ]);
  });

  it("omits the comparison without past snapshots", () => {
    render(<NetWorthCard netWorth={0} snapshots={[]} />);

    expect(screen.queryByTestId("delta")).toBeNull();
  });

  it.each([
    {
      color: "success",
      postResult: () => Promise.resolve({ success: true }),
    },
    {
      color: "danger",
      postResult: () => Promise.reject(new Error("nope")),
    },
  ])("adds a snapshot of today's net worth ($color)", async ({
    color,
    postResult,
  }) => {
    postSnapshotAsync.mockImplementation(postResult);
    render(<NetWorthCard netWorth={1000} snapshots={[]} />);

    fireEvent.click(screen.getByText("New Snapshot"));

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color }));
    });
    expect(postSnapshotAsync).toHaveBeenCalledWith({
      date: now,
      valueCents: 1000_00,
    });
  });
});
