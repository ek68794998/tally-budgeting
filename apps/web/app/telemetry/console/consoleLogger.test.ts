import {
  Authorization,
  ContentType,
  Created,
  Get,
  InternalServerError,
  Ok,
  Post,
} from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import { type EventLogLevel } from "@tally/data-models/contracts/api/postEvents";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConsoleLogger } from "./consoleLogger";

describe("ConsoleLogger", () => {
  const noop = () => {
    /* Do nothing */
  };

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00.000Z"));
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(noop);
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(noop);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("creates logger with default min level (info)", () => {
      const logger = new ConsoleLogger();
      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it("creates logger with custom min level", () => {
      const logger = new ConsoleLogger("debug");
      expect(logger).toBeInstanceOf(ConsoleLogger);
    });
  });

  describe("error", () => {
    it("logs error event without data", () => {
      const logger = new ConsoleLogger();
      logger.error("error-event");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("ERROR"),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[BACKEND]"),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("error-event"),
      );
    });

    it("logs error event with data", () => {
      const logger = new ConsoleLogger();
      const data = { message: "Something went wrong" };
      logger.error("error-event", data);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("error-event Something went wrong"),
      );
    });

    it("always logs errors regardless of min level", () => {
      const logger = new ConsoleLogger("debug");
      logger.error("error-event");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("warn", () => {
    it("logs warn event without data", () => {
      const logger = new ConsoleLogger();
      logger.warn("warning-event");

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("WARN"),
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[BACKEND]"),
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("warning-event"),
      );
    });

    it("logs warn event with data", () => {
      const logger = new ConsoleLogger();
      const data = { reason: "deprecated-api" };
      logger.warn("warning-event", data);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(data, null, 2)),
      );
    });

    it("does not log when min level is error", () => {
      const logger = new ConsoleLogger("error");
      logger.warn("warning-event");

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe("info", () => {
    it("logs info event without data", () => {
      const logger = new ConsoleLogger();
      logger.info("info-event");

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("INFO"),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("[BACKEND]"),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("info-event"),
      );
    });

    it("logs info event with data", () => {
      const logger = new ConsoleLogger();
      const data = { userId: "123" };
      logger.info("info-event", data);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(data, null, 2)),
      );
    });

    it.each<[EventLogLevel, boolean]>([
      ["error", false],
      ["warn", false],
      ["info", true],
      ["http", true],
      ["debug", true],
    ])("with min level %s, info is logged: %s", (minLevel, shouldLog) => {
      const logger = new ConsoleLogger(minLevel);
      logger.info("info-event");

      if (shouldLog) {
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      } else {
        expect(consoleInfoSpy).not.toHaveBeenCalled();
      }
    });
  });

  describe("debug", () => {
    it("logs debug event without data when min level is debug", () => {
      const logger = new ConsoleLogger("debug");
      logger.debug("debug-event");

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("DEBUG"),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("[BACKEND]"),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("debug-event"),
      );
    });

    it("logs debug event with data", () => {
      const logger = new ConsoleLogger("debug");
      const data = { value: 42 };
      logger.debug("debug-event", data);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(data, null, 2)),
      );
    });

    it("does not log when min level is info", () => {
      const logger = new ConsoleLogger("info");
      logger.debug("debug-event");

      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });
  });

  describe("httpIncoming", () => {
    it("logs http incoming event without headers", () => {
      const logger = new ConsoleLogger("http");
      const data = {
        duration: 150,
        method: Get,
        path: "/api/users",
        statusCode: Ok,
      };
      logger.httpIncoming("http-request", data);

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("HTTP"),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("http-request"),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"method": "GET"'),
      );
    });

    it("sanitizes headers in http incoming event", () => {
      const logger = new ConsoleLogger("http");
      const data = {
        duration: 150,
        headers: {
          [Authorization]: "Bearer secret-token",
          [ContentType]: "application/json",
        },
        method: Post,
        path: "/api/users",
        statusCode: Created,
      };
      logger.httpIncoming("http-request", data);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"Authorization": "[REDACTED]"'),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"Content-Type": "application/json"'),
      );
    });

    it("handles http incoming event with error", () => {
      const logger = new ConsoleLogger("http");
      const error = new Error("Request failed");
      const data = {
        duration: 150,
        error,
        method: Get,
        path: "/api/users",
        statusCode: InternalServerError,
      };
      logger.httpIncoming("http-request", data);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"error"'),
      );
    });

    it("does not log when min level is info", () => {
      const logger = new ConsoleLogger("info");
      const data = {
        duration: 150,
        method: Get,
        path: "/api/users",
        statusCode: Ok,
      };
      logger.httpIncoming("http-request", data);

      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });
  });

  describe("httpOutgoing", () => {
    it("logs http outgoing event without headers", () => {
      const logger = new ConsoleLogger("http");
      const data = {
        duration: 150,
        method: Get,
        statusCode: Ok,
        url: "https://api.example.com/users",
      };
      logger.httpOutgoing("http-request", data);

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("HTTP"),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("http-request"),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"method": "GET"'),
      );
    });

    it("sanitizes headers in http outgoing event", () => {
      const logger = new ConsoleLogger("http");
      const data = {
        duration: 150,
        headers: {
          [Authorization]: "Bearer secret-token",
          [ContentType]: ApplicationJson,
        },
        method: Post,
        statusCode: Created,
        url: "https://api.example.com/users",
      };
      logger.httpOutgoing("http-request", data);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"Authorization": "[REDACTED]"'),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"Content-Type": "application/json"'),
      );
    });

    it("handles http outgoing event with error", () => {
      const logger = new ConsoleLogger("http");
      const error = new Error("Request failed");
      const data = {
        duration: 150,
        error,
        method: Post,
        statusCode: InternalServerError,
        url: "https://api.example.com/users",
      };
      logger.httpOutgoing("http-request", data);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"error"'),
      );
    });
  });

  describe("log formatting", () => {
    it("includes timestamp in log message", () => {
      const logger = new ConsoleLogger();
      logger.info("test-event");

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("2024-01-01T12:00:00.000Z"),
      );
    });

    it("includes event name in log message", () => {
      const logger = new ConsoleLogger();
      logger.info("test-event");

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("test-event"),
      );
    });

    it("includes source as BACKEND in log message", () => {
      const logger = new ConsoleLogger();
      logger.info("test-event");

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("[BACKEND]"),
      );
    });

    it("formats data as JSON with indentation", () => {
      const logger = new ConsoleLogger();
      const data = { key1: "value1", key2: { nested: "value2" } };
      logger.info("test-event", data);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(data, null, 2)),
      );
    });

    it("does not include data section when data is undefined", () => {
      const logger = new ConsoleLogger();
      logger.info("test-event");

      const call = consoleInfoSpy.mock.calls[0];
      invariant(call);
      const message = call[0];
      expect(message).not.toMatch(/\n/);
    });

    it("does not include data section when data is empty object", () => {
      const logger = new ConsoleLogger();
      logger.info("test-event", {});

      const call = consoleInfoSpy.mock.calls[0];
      invariant(call);
      const message = call[0];
      expect(message).not.toMatch(/\n\{/);
    });
  });

  describe("level filtering", () => {
    it.each<[EventLogLevel, EventLogLevel, boolean]>([
      ["error", "error", true],
      ["error", "warn", false],
      ["error", "info", false],
      ["error", "http", false],
      ["error", "debug", false],
      ["warn", "error", true],
      ["warn", "warn", true],
      ["warn", "info", false],
      ["warn", "http", false],
      ["warn", "debug", false],
      ["info", "error", true],
      ["info", "warn", true],
      ["info", "info", true],
      ["info", "http", false],
      ["info", "debug", false],
      ["http", "error", true],
      ["http", "warn", true],
      ["http", "info", true],
      ["http", "http", true],
      ["http", "debug", false],
      ["debug", "error", true],
      ["debug", "warn", true],
      ["debug", "info", true],
      ["debug", "http", true],
      ["debug", "debug", true],
    ])("with min level %s, level %s is logged: %s", (minLevel, eventLevel, shouldLog) => {
      const logger = new ConsoleLogger(minLevel);

      if (eventLevel === "error") {
        logger.error("test-event");

        if (shouldLog) {
          expect(consoleErrorSpy).toHaveBeenCalled();
        } else {
          expect(consoleErrorSpy).not.toHaveBeenCalled();
        }
      } else if (eventLevel === "warn") {
        logger.warn("test-event");

        if (shouldLog) {
          expect(consoleWarnSpy).toHaveBeenCalled();
        } else {
          expect(consoleWarnSpy).not.toHaveBeenCalled();
        }
      } else if (eventLevel === "info") {
        logger.info("test-event");

        if (shouldLog) {
          expect(consoleInfoSpy).toHaveBeenCalled();
        } else {
          expect(consoleInfoSpy).not.toHaveBeenCalled();
        }
      } else if (eventLevel === "http") {
        logger.httpIncoming("test-event", {
          method: Get,
          path: "/test",
        });

        if (shouldLog) {
          expect(consoleInfoSpy).toHaveBeenCalled();
        } else {
          expect(consoleInfoSpy).not.toHaveBeenCalled();
        }
      } else {
        logger.debug("test-event");

        if (shouldLog) {
          expect(consoleInfoSpy).toHaveBeenCalled();
        } else {
          expect(consoleInfoSpy).not.toHaveBeenCalled();
        }
      }
    });
  });
});
