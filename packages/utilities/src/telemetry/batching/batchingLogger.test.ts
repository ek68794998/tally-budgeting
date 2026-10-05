import {
  Authorization,
  ContentType,
  Created,
  Get,
  Ok,
  Post,
} from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import { dangerouslyCoerceType } from "@ekumlin/typescript-toolkit/testing";
import { isString } from "@ekumlin/typescript-toolkit/types";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import { postEventsRequestSchema } from "@tally/data-models/contracts/api/postEvents";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BatchingLogger } from "./batchingLogger";

describe("BatchingLogger", () => {
  const noop = () => {
    /* Do nothing */
  };

  const endpoint = "https://example.com/events";
  const mockFetch = vi.fn();

  const parseBody = (bodyOrCall: unknown) => {
    const bodyContent = isString(bodyOrCall)
      ? bodyOrCall
      : dangerouslyCoerceType<Record<string, unknown>>(bodyOrCall).body;

    const bodyString = String(bodyContent);

    return postEventsRequestSchema.parse(JSON.parse(bodyString));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("creates logger with default options", () => {
      const logger = new BatchingLogger(endpoint);
      expect(logger).toBeInstanceOf(BatchingLogger);
    });

    it("creates logger with custom options", () => {
      const logger = new BatchingLogger(endpoint, 10, 5000);
      expect(logger).toBeInstanceOf(BatchingLogger);
    });

    it("starts timer on construction", () => {
      new BatchingLogger(endpoint);
      expect(vi.getTimerCount()).toBe(1);
    });
  });

  describe("info", () => {
    it("logs info event without data", () => {
      const logger = new BatchingLogger(endpoint);
      logger.info("test-event");

      vi.advanceTimersByTime(10000);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      invariant(call);
      expect(call[0]).toBe(endpoint);
      const body = parseBody(call[1]);
      expect(body.events).toHaveLength(1);
      expect(body.events[0]).toMatchObject({
        event: "test-event",
        level: "info",
        source: "FRONTEND",
      });
      expect(body.events[0]?.timestamp).toBeDefined();
    });

    it("logs info event with data", () => {
      const logger = new BatchingLogger(endpoint);
      const data = { action: "click", message: "foo", userId: "123" };
      logger.info("test-event", data);

      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]?.data).toEqual(data);
    });
  });

  describe("warn", () => {
    it("logs warn event without data", () => {
      const logger = new BatchingLogger(endpoint);
      logger.warn("warning-event");

      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]).toMatchObject({
        event: "warning-event",
        level: "warn",
        source: "FRONTEND",
      });
    });

    it("logs warn event with data", () => {
      const logger = new BatchingLogger(endpoint);
      const data = { message: "invalid-input" };
      logger.warn("warning-event", data);

      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]?.data).toEqual(data);
    });
  });

  describe("debug", () => {
    it("logs debug event without data", () => {
      const logger = new BatchingLogger(endpoint);
      logger.debug("debug-event");

      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]).toMatchObject({
        event: "debug-event",
        level: "debug",
        source: "FRONTEND",
      });
    });

    it("logs debug event with data", () => {
      const logger = new BatchingLogger(endpoint);
      const data = { message: "42", value: 42 };
      logger.debug("debug-event", data);

      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]?.data).toEqual(data);
    });
  });

  describe("error", () => {
    it("logs error event and flushes immediately", () => {
      const logger = new BatchingLogger(endpoint);
      logger.error("error-event");

      expect(mockFetch).toHaveBeenCalledTimes(1);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]).toMatchObject({
        event: "error-event",
        level: "error",
        source: "FRONTEND",
      });
    });

    it("logs error event with data", () => {
      const logger = new BatchingLogger(endpoint);
      const data = { error: "Something went wrong", message: "42" };
      logger.error("error-event", data);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]?.data).toEqual(data);
    });

    it("resets timer after immediate flush", () => {
      const logger = new BatchingLogger(endpoint);
      logger.error("error-event");

      expect(vi.getTimerCount()).toBe(1);
    });
  });

  describe("httpOutgoing", () => {
    it("logs http event without headers", () => {
      const logger = new BatchingLogger(endpoint);
      const data = {
        method: Get,
        url: "https://api.example.com/users",
      };
      logger.httpOutgoing("http-request", data);

      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]).toMatchObject({
        data,
        event: "http-request:START",
        level: "http",
        source: "FRONTEND",
      });
    });

    it("sanitizes headers in http event", () => {
      const logger = new BatchingLogger(endpoint);
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

      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]?.data?.headers).toEqual({
        [Authorization]: "[REDACTED]",
        [ContentType]: ApplicationJson,
      });
    });

    it("handles http event without headers field", () => {
      const logger = new BatchingLogger(endpoint);
      const data = {
        duration: 150,
        method: Get,
        statusCode: Ok,
        url: "https://api.example.com/users",
      };
      logger.httpOutgoing("http-request", data);

      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]?.data?.headers).toBeUndefined();
    });
  });

  describe("batching behavior", () => {
    it("flushes when batch size limit is reached", () => {
      const logger = new BatchingLogger(endpoint, 3);
      logger.info("event-1");
      logger.info("event-2");
      expect(mockFetch).not.toHaveBeenCalled();

      logger.info("event-3");
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events).toHaveLength(3);
    });

    it("flushes when flush interval elapses", () => {
      const logger = new BatchingLogger(endpoint, 50, 5000);
      logger.info("event-1");
      logger.info("event-2");

      expect(mockFetch).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5000);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events).toHaveLength(2);
    });

    it("resets timer after flush", () => {
      const logger = new BatchingLogger(endpoint, 2);
      logger.info("event-1");
      logger.info("event-2");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      mockFetch.mockClear();

      logger.info("event-3");
      vi.advanceTimersByTime(10000);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events).toHaveLength(1);
    });

    it("does not flush empty batch", () => {
      new BatchingLogger(endpoint);

      vi.advanceTimersByTime(10000);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("clears batch after flush", () => {
      const logger = new BatchingLogger(endpoint, 2);
      logger.info("event-1");
      logger.info("event-2");

      expect(mockFetch).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(10000);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("fetch request", () => {
    it("sends POST request to endpoint", () => {
      const logger = new BatchingLogger(endpoint);
      logger.info("test-event");
      vi.advanceTimersByTime(10000);

      expect(mockFetch).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({
          method: Post,
        }),
      );
    });

    it("sets correct headers", () => {
      const logger = new BatchingLogger(endpoint);
      logger.info("test-event");
      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const headers = dangerouslyCoerceType<Record<string, Headers>>(
        call[1],
      ).headers;
      invariant(headers);
      expect(headers.get(ContentType)).toBe(ApplicationJson);
    });

    it("uses keepalive flag", () => {
      const logger = new BatchingLogger(endpoint);
      logger.info("test-event");
      vi.advanceTimersByTime(10000);

      expect(mockFetch).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({
          keepalive: true,
        }),
      );
    });

    it("handles fetch errors gracefully", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(noop);
      mockFetch.mockRejectedValue(new Error("Network error"));

      const logger = new BatchingLogger(endpoint);
      logger.info("test-event");
      vi.advanceTimersByTime(10000);

      expect(mockFetch).toHaveBeenCalled();

      return vi.waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            "[Telemetry] Failed to send events to backend",
          ),
          expect.any(String),
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          "Error details:",
          expect.any(Error),
        );
      });
    });
  });

  describe("timestamp", () => {
    it("generates ISO timestamp for each event", () => {
      const logger = new BatchingLogger(endpoint);
      const mockDate = new Date("2024-01-01T12:00:00.000Z");
      vi.setSystemTime(mockDate);

      logger.info("test-event");
      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]?.timestamp).toBe("2024-01-01T12:00:00.000Z");
    });

    it("generates different timestamps for events logged at different times", () => {
      const logger = new BatchingLogger(endpoint);
      vi.setSystemTime(new Date("2024-01-01T12:00:00.000Z"));
      logger.info("event-1");

      vi.setSystemTime(new Date("2024-01-01T12:00:01.000Z"));
      logger.info("event-2");

      vi.advanceTimersByTime(10000);

      const call = mockFetch.mock.calls[0];
      invariant(call);
      const body = parseBody(call[1]);
      expect(body.events[0]?.timestamp).toBe("2024-01-01T12:00:00.000Z");
      expect(body.events[1]?.timestamp).toBe("2024-01-01T12:00:01.000Z");
    });
  });
});
