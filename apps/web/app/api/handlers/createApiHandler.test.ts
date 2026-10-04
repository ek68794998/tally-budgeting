import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { StructuredError } from "@tally/data-models/error/structuredError";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import z from "zod";
import { isAuthenticatedAsync } from "../../auth/verifyRequest";
import { createApiHandler } from "./createApiHandler";
import { HttpError } from "./httpError";

vi.mock("../../auth/verifyRequest", () => ({
  isAuthenticatedAsync: vi.fn(),
}));

vi.mock("../../telemetry/telemetry", () => ({
  telemetry: () => ({
    error: vi.fn(),
    httpIncoming: () => ({ end: vi.fn() }),
  }),
}));

const mockIsAuthenticated = vi.mocked(isAuthenticatedAsync);

const handler = vi.fn(() => Promise.resolve({ statusCode: NoContent }));

const buildRoute = (access?: "authenticated" | "public") =>
  createApiHandler({
    access,
    eventName: "TEST",
    handler,
    schemata: {
      body: z.unknown(),
      params: z.unknown(),
      query: z.unknown(),
    },
  });

const buildRequest = (
  method: string,
  ...headerEntries: [string, string][]
): NextRequest =>
  new NextRequest("http://localhost/api/test", {
    headers: new Headers([["host", "localhost"], ...headerEntries]),
    method,
  });

const callAsync = (
  route: ReturnType<typeof buildRoute>,
  request: NextRequest,
) => route(request, { params: Promise.resolve({}) });

describe("createApiHandler guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated.mockResolvedValue(true);
  });

  it("responds 401 and skips the handler when unauthenticated", async () => {
    mockIsAuthenticated.mockResolvedValue(false);

    const response = await callAsync(buildRoute(), buildRequest("GET"));

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("runs the handler when authenticated", async () => {
    const response = await callAsync(buildRoute(), buildRequest("GET"));

    expect(response.status).toBe(NoContent);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("lets public routes through without checking auth", async () => {
    mockIsAuthenticated.mockResolvedValue(false);

    const response = await callAsync(buildRoute("public"), buildRequest("GET"));

    expect(response.status).toBe(NoContent);
    expect(mockIsAuthenticated).not.toHaveBeenCalled();
  });

  it.each<[string, [string, string][], number]>([
    ["a mismatched Origin", [["origin", "http://evil"]], 403],
    ["a matching Origin", [["origin", "http://localhost"]], NoContent],
    ["no Origin", [], NoContent],
    [
      "a forwarded host that matches the Origin",
      [
        ["origin", "https://app.example.com"],
        ["x-forwarded-host", "app.example.com"],
      ],
      NoContent,
    ],
    [
      "a forwarded host that differs from the Origin",
      [
        ["origin", "http://localhost"],
        ["x-forwarded-host", "app.example.com"],
      ],
      403,
    ],
    ["an unparseable Origin", [["origin", "not a url"]], 403],
  ])("handles a POST with %s", async (_name, headers, expectedStatus) => {
    const response = await callAsync(
      buildRoute(),
      buildRequest("POST", ...headers),
    );

    expect(response.status).toBe(expectedStatus);
  });

  it("does not apply the Origin check to GET", async () => {
    const response = await callAsync(
      buildRoute(),
      buildRequest("GET", ["origin", "http://evil"]),
    );

    expect(response.status).toBe(NoContent);
  });

  it("responds 429 once the global per-IP limit is exhausted", async () => {
    const route = buildRoute();
    const request = () =>
      buildRequest("GET", ["x-forwarded-for", "203.0.113.9"]);

    const statuses: number[] = [];

    for (let i = 0; i < 301; i++) {
      statuses.push((await callAsync(route, request())).status);
    }

    expect(statuses.slice(0, 300).every((s) => s === NoContent)).toBe(true);
    expect(statuses[300]).toBe(429);
  });
});

describe("createApiHandler error mapping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated.mockResolvedValue(true);
  });

  it.each([
    {
      error: new HttpError("Nope", 404, "http404", { id: "1" }),
      expectedBody: {
        error: {
          code: "http404",
          params: { id: "1" },
          type: "HttpError",
        },
        success: false,
      },
      expectedStatus: 404,
    },
    {
      error: new StructuredError("Broken", "invalidAccount"),
      expectedBody: {
        error: { code: "invalidAccount", type: "StructuredError" },
        success: false,
      },
      expectedStatus: 500,
    },
    {
      error: new Error("Connection terminated due to connection timeout"),
      expectedBody: {
        error: {
          code: "databaseUnavailable",
          params: {},
          type: "DatabaseUnavailableError",
        },
        success: false,
      },
      expectedStatus: 503,
    },
    {
      error: "a thrown string",
      expectedBody: {
        error: { code: "http500", params: {}, type: "string" },
        success: false,
      },
      expectedStatus: 500,
    },
  ])("maps a thrown $error.constructor.name to $expectedStatus", async ({
    error,
    expectedBody,
    expectedStatus,
  }) => {
    handler.mockRejectedValueOnce(error);

    const response = await callAsync(buildRoute(), buildRequest("GET"));

    expect(response.status).toBe(expectedStatus);
    await expect(response.json()).resolves.toEqual(expectedBody);
  });
});
