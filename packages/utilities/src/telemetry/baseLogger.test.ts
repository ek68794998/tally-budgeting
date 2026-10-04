import {
  Authorization,
  ContentType,
  Get,
} from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
  type EventLogData,
  type EventLogEntry,
  type EventLogLevel,
} from "@tally/data-models/contracts/api/postEvents";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BaseLogger } from "./baseLogger";

class TestLogger extends BaseLogger {
  public readonly logCalls: {
    data?: EventLogData;
    event: string;
    level: EventLogLevel;
  }[] = [];

  public event(_entry: EventLogEntry): void {
    // not needed for these tests
  }

  protected log(
    level: EventLogLevel,
    event: string,
    data?: EventLogData,
  ): void {
    this.logCalls.push({ data, event, level });
  }
}

describe("BaseLogger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("profile", () => {
    it("logs START and END events with duration", () => {
      const logger = new TestLogger();
      let callCount = 0;
      vi.spyOn(Date, "now").mockImplementation(() =>
        callCount++ === 0 ? 1000 : 1500,
      );

      const profiler = logger.profile("myEvent", { message: "starting" });

      expect(logger.logCalls).toHaveLength(1);
      expect(logger.logCalls[0]).toEqual({
        data: { message: "starting" },
        event: "myEvent:START",
        level: "info",
      });

      profiler.end({ message: "done" });

      expect(logger.logCalls).toHaveLength(2);
      expect(logger.logCalls[1]).toEqual({
        data: { duration: 500, message: "done" },
        event: "myEvent:END",
        level: "info",
      });
    });

    it("logs START with no data when none provided", () => {
      const logger = new TestLogger();
      vi.spyOn(Date, "now").mockReturnValue(0);

      logger.profile("bareEvent");

      expect(logger.logCalls[0]).toEqual({
        data: undefined,
        event: "bareEvent:START",
        level: "info",
      });
    });
  });

  describe("httpOutgoing end callback", () => {
    it("logs END event with duration and end data", () => {
      const logger = new TestLogger();
      let callCount = 0;
      vi.spyOn(Date, "now").mockImplementation(() =>
        callCount++ === 0 ? 2000 : 2300,
      );

      const profiler = logger.httpOutgoing("http-call", {
        method: Get,
        url: "https://example.com/api",
      });

      expect(logger.logCalls[0]?.event).toBe("http-call:START");

      profiler.end({
        method: Get,
        statusCode: 200,
        url: "https://example.com/api",
      });

      expect(logger.logCalls).toHaveLength(2);
      expect(logger.logCalls[1]).toMatchObject({
        data: { duration: 300, statusCode: 200 },
        event: "http-call:END",
        level: "http",
      });
    });

    it("redacts Authorization header in START event", () => {
      const logger = new TestLogger();
      vi.spyOn(Date, "now").mockReturnValue(0);

      logger.httpOutgoing("http-call", {
        headers: {
          [Authorization]: "Bearer secret",
          [ContentType]: [ApplicationJson],
        },
        method: "POST",
        url: "https://example.com/api",
      });

      expect(logger.logCalls[0]?.data?.headers).toEqual({
        [Authorization]: "[REDACTED]",
        [ContentType]: [ApplicationJson],
      });
    });
  });
});
