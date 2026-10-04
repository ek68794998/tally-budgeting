import { afterEach, describe, expect, it, vi } from "vitest";
import { BatchingLogger } from "./batching/batchingLogger";
import { telemetry } from "./telemetry";

describe("telemetry", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("lazily creates one batching logger and reuses it", () => {
    vi.useFakeTimers();

    const logger = telemetry();

    expect(logger).toBeInstanceOf(BatchingLogger);
    expect(telemetry()).toBe(logger);
  });
});
