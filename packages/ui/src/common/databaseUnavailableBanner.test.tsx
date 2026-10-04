import { Alert } from "@heroui/react";
import { useDatabaseStatusStore } from "@tally/utilities/state/databaseStatus";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DatabaseUnavailableBanner,
  healthPollIntervalMs,
} from "./databaseUnavailableBanner";

vi.mock("@heroui/react", () => ({
  Alert: vi.fn(() => <div data-testid="alert" />),
}));

const error = vi.fn();

vi.mock("@tally/utilities/telemetry/telemetry", () => ({
  telemetry: () => ({ error }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const renderBanner = () => {
  const queryClient = new QueryClient();
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

  render(
    <QueryClientProvider client={queryClient}>
      <DatabaseUnavailableBanner />
    </QueryClientProvider>,
  );

  return { invalidateQueries };
};

const stubHealthResponse = (status: number) => {
  const fetchMock = vi.fn(() =>
    Promise.resolve(new Response(null, { status })),
  );
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
};

const advancePollAsync = () =>
  act(() => vi.advanceTimersByTimeAsync(healthPollIntervalMs));

describe("DatabaseUnavailableBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    useDatabaseStatusStore.getState().clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders nothing and does not poll while the database is available", async () => {
    const fetchMock = stubHealthResponse(204);
    renderBanner();

    await advancePollAsync();

    expect(screen.queryByTestId("alert")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a warning and keeps polling while the health check fails", async () => {
    const fetchMock = stubHealthResponse(503);
    renderBanner();

    act(() => useDatabaseStatusStore.getState().markUnavailable());
    await advancePollAsync();
    await advancePollAsync();

    expect(screen.getByTestId("alert")).toBeInTheDocument();
    expect(vi.mocked(Alert)).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "danger",
        description: "body",
        title: "title",
      }),
      undefined,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith("/api/health", undefined);
  });

  it("hides and refetches queries once the database recovers", async () => {
    stubHealthResponse(204);
    const { invalidateQueries } = renderBanner();

    act(() => useDatabaseStatusStore.getState().markUnavailable());
    await advancePollAsync();

    expect(screen.queryByTestId("alert")).toBeNull();
    expect(useDatabaseStatusStore.getState().isUnavailable).toBe(false);
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });

  it("keeps the banner up and logs when the health check cannot be reached", async () => {
    const offlineError = new Error("offline");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(offlineError)),
    );
    renderBanner();

    act(() => useDatabaseStatusStore.getState().markUnavailable());
    await advancePollAsync();

    expect(screen.getByTestId("alert")).toBeInTheDocument();
    expect(error).toHaveBeenCalledWith("DATABASE_HEALTH_CHECK_FAILED", {
      error: offlineError,
    });
  });
});
