import { NotFound, Ok } from "@ekumlin/typescript-toolkit/http";
import { addToast } from "@heroui/react";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { useApiResponseValidator } from "./useApiResponseValidator";

vi.mock("@heroui/react", () => ({
  addToast: vi.fn(),
}));

vi.mock("@tally/utilities/telemetry/telemetry", () => ({
  telemetry: vi.fn(() => ({
    error: vi.fn(),
  })),
}));

describe("useApiResponseValidator", () => {
  it("should validate successful response with schema", async () => {
    const { result } = renderHook(() => useApiResponseValidator());

    const mockSchema = z.object({
      data: z.string(),
      error: z.undefined().optional(),
      success: z.boolean(),
    });

    const mockResponse = new Response(
      JSON.stringify({ data: "test", success: true }),
      { status: Ok },
    );

    const validationResult = await result.current.validateApiResponseAsync({
      response: mockResponse,
      responseSchema: mockSchema,
    });

    expect(validationResult).toEqual({ data: "test", success: true });
  });

  it("should validate successful response without schema", async () => {
    const { result } = renderHook(() => useApiResponseValidator());

    const mockResponse = new Response(
      JSON.stringify({ data: "test", success: true }),
      { status: Ok },
    );

    const validationResult = await result.current.validateApiResponseAsync({
      response: mockResponse,
      responseSchema: z.unknown(),
    });

    expect(validationResult).toEqual({ data: "test", success: true });
  });

  it("should throw and show toast when response.ok is false", async () => {
    const { result } = renderHook(() => useApiResponseValidator());

    const mockResponse = new Response(JSON.stringify({ error: "Not found" }), {
      status: NotFound,
    });

    const validationResult = await result.current.validateApiResponseAsync({
      response: mockResponse,
      responseSchema: z.unknown(),
    });

    expect(validationResult).toBe(false);

    expect(addToast).toHaveBeenCalledWith({
      color: "danger",
      description:
        "The request failed. Please check your connection and try again.",
      title: "Request Failed",
    });
  });

  it("should throw and show toast when schema validation fails", async () => {
    const { result } = renderHook(() => useApiResponseValidator());

    const mockSchema = z.object({
      data: z.string(),
      success: z.boolean(),
    });

    const mockResponse = new Response(
      JSON.stringify({ data: 123, success: true }), // data should be string, not number
      { status: Ok },
    );

    const validationResult = await result.current.validateApiResponseAsync({
      response: mockResponse,
      responseSchema: mockSchema,
    });

    expect(validationResult).toBe(false);

    expect(addToast).toHaveBeenCalledWith({
      color: "danger",
      description:
        "The server returned data in an unexpected format. Please try again.",
      title: "Validation Error",
    });
  });

  it("returns false without a toast on 401, leaving it to the session handler", async () => {
    vi.mocked(addToast).mockClear();
    const { result } = renderHook(() => useApiResponseValidator());

    const validationResult = await result.current.validateApiResponseAsync({
      response: new Response(null, { status: 401 }),
      responseSchema: z.unknown(),
    });

    expect(validationResult).toBe(false);
    expect(addToast).not.toHaveBeenCalled();
  });

  it("treats an empty body as undefined", async () => {
    const { result } = renderHook(() => useApiResponseValidator());

    const validationResult = await result.current.validateApiResponseAsync({
      response: new Response(null, { status: 204 }),
      responseSchema: z.undefined(),
    });

    expect(validationResult).toBeUndefined();
  });

  it("rethrows errors other than a JSON syntax error", async () => {
    const { result } = renderHook(() => useApiResponseValidator());
    const response = mockIncompleteObject<Response>({
      json: () => Promise.reject(new Error("stream failed")),
      ok: true,
      status: Ok,
    });

    await expect(
      result.current.validateApiResponseAsync({
        response,
        responseSchema: z.unknown(),
      }),
    ).rejects.toThrow("stream failed");
  });
});
