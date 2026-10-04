import {
  BadRequest,
  ContentType,
  Post,
} from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import z from "zod";
import { parseRequestAsync } from "./parseRequest";

vi.mock(
  "../../telemetry/telemetry",
  async () => (await import("../testing/routeTesting")).silentTelemetryModule,
);

const emptySchemata = {
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
};

const makeRequest = (
  url: string,
  body: unknown = {},
  headers: Record<string, string> = {},
): NextRequest => {
  const req = new NextRequest(url, {
    body: JSON.stringify(body),
    headers: { [ContentType]: ApplicationJson, ...headers },
    method: Post,
  });

  return req;
};

describe("parseRequestAsync", () => {
  describe("success path", () => {
    it("returns success with parsed body, query, and params", async () => {
      const schemata = {
        body: z.object({ name: z.string() }),
        params: z.object({ id: z.coerce.number() }),
        query: z.object({ page: z.coerce.number().optional() }),
      };

      const req = makeRequest("http://localhost/api/test?page=2", {
        name: "Alice",
      });

      const result = await parseRequestAsync(
        req,
        undefined,
        { id: "5" },
        schemata,
      );

      invariant(result.success);

      expect(result.body).toEqual({ name: "Alice" });
      expect(result.query).toEqual({ page: 2 });
      expect(result.params).toEqual({ id: 5 });
    });

    it("returns an ip field on success", async () => {
      const forwardedHeader = "X-Forwarded-For";
      const req = makeRequest(
        "http://localhost/api/test",
        {},
        { [forwardedHeader]: "1.2.3.4" },
      );

      const result = await parseRequestAsync(req, undefined, {}, emptySchemata);

      invariant(result.success);

      expect(result.ip).toBe("1.2.3.4");
    });

    it("uses custom parser when provided", async () => {
      const schemata = {
        body: z.object({ value: z.number() }),
        params: z.object({}),
        query: z.object({}),
      };

      const req = makeRequest("http://localhost/api/test");
      const customParser = () => Promise.resolve({ value: 42 });

      const result = await parseRequestAsync(req, customParser, {}, schemata);

      invariant(result.success);

      expect(result.body).toEqual({ value: 42 });
    });
  });

  describe("failure: invalid body", () => {
    it("returns failure when body does not match schema", async () => {
      const schemata = {
        body: z.object({ name: z.string() }),
        params: z.object({}),
        query: z.object({}),
      };

      const req = makeRequest("http://localhost/api/test", { name: 123 });

      const result = await parseRequestAsync(req, undefined, {}, schemata);

      invariant(!result.success);

      expect(result.error.code).toBe("invalidRequestBody");
      expect(result.statusCode).toBe(BadRequest);
    });

    it("returns failure with empty object when body is unparseable JSON", async () => {
      const schemata = {
        body: z.object({ name: z.string() }),
        params: z.object({}),
        query: z.object({}),
      };

      const req = new NextRequest("http://localhost/api/test", {
        body: "not json at all!!!",
        headers: { [ContentType]: ApplicationJson },
        method: Post,
      });

      const result = await parseRequestAsync(req, undefined, {}, schemata);

      // Body falls back to {} which fails schema { name: string }
      invariant(!result.success);

      expect(result.error.code).toBe("invalidRequestBody");
    });
  });

  describe("failure: invalid query parameters", () => {
    it("returns failure when query does not match schema", async () => {
      const schemata = {
        body: z.object({}),
        params: z.object({}),
        query: z.object({ page: z.number() }),
      };

      const req = makeRequest("http://localhost/api/test?page=notanumber", {});

      const result = await parseRequestAsync(req, undefined, {}, schemata);

      invariant(!result.success);

      expect(result.error.code).toBe("invalidQueryParameters");
      expect(result.statusCode).toBe(BadRequest);
    });
  });

  describe("failure: invalid route parameters", () => {
    it("returns failure when params do not match schema", async () => {
      const schemata = {
        body: z.object({}),
        params: z.object({ id: z.number() }),
        query: z.object({}),
      };

      const req = makeRequest("http://localhost/api/test");

      const result = await parseRequestAsync(
        req,
        undefined,
        { id: "not-a-number" },
        schemata,
      );

      invariant(!result.success);

      expect(result.error.code).toBe("invalidRouteParameters");
      expect(result.statusCode).toBe(BadRequest);
    });
  });

  describe("IP extraction", () => {
    it.each([
      ["X-Forwarded-For", "10.0.0.1"],
      ["X-Real-IP", "10.0.0.2"],
    ])("reads IP from %s header", async (header, expectedIp) => {
      const req = makeRequest(
        "http://localhost/api/test",
        {},
        { [header]: expectedIp },
      );

      const result = await parseRequestAsync(req, undefined, {}, emptySchemata);

      expect(result.ip).toBe(expectedIp);
    });

    it("falls back to (UNKNOWN) when no IP headers present", async () => {
      const req = new NextRequest("http://localhost/api/test", {
        body: JSON.stringify({}),
        headers: { [ContentType]: ApplicationJson },
        method: Post,
      });

      const result = await parseRequestAsync(req, undefined, {}, emptySchemata);

      invariant(result.success);

      expect(result.ip).toBe("(UNKNOWN)");
    });
  });

  describe("failure: parser throws", () => {
    it("returns an invalid-shape failure when the custom parser throws synchronously", async () => {
      const result = await parseRequestAsync(
        makeRequest("http://localhost/api/test"),
        () => {
          throw new Error("bad form data");
        },
        {},
        emptySchemata,
      );

      invariant(!result.success);

      expect(result.statusCode).toBe(BadRequest);
      expect(result.error.code).toBe("invalidRequestShape");
    });
  });
});
