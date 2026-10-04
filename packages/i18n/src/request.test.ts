import fs from "node:fs/promises";
import { headers } from "next/headers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getLocaleAsync, requestConfig } from "./request";
import en from "./strings/en.json";
import ja from "./strings/ja.json";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

// `getRequestConfig` only registers the callback with Next; unwrap it so the callback can be invoked.
vi.mock("next-intl/server", () => ({
  getRequestConfig: (callback: unknown) => callback,
}));

vi.mock("node:fs/promises", () => ({
  default: { readFile: vi.fn() },
}));

const mockHeaders = (acceptLanguage?: string) => {
  vi.mocked(headers).mockResolvedValue(
    new Headers(acceptLanguage ? [["accept-language", acceptLanguage]] : []),
  );
};

type RequestConfigCallback = (params: {
  requestLocale: Promise<string | undefined>;
}) => Promise<{ locale: string; messages: typeof en }>;

// The mock above makes `requestConfig` the raw callback.
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const invokeRequestConfig = requestConfig as unknown as RequestConfigCallback;

describe("getLocaleAsync", () => {
  it.each([
    { acceptLanguage: undefined, expected: "en" },
    { acceptLanguage: "ja-JP,ja;q=0.9", expected: "ja" },
    { acceptLanguage: "fr-FR", expected: "en" },
  ])("resolves $acceptLanguage to $expected", async ({
    acceptLanguage,
    expected,
  }) => {
    mockHeaders(acceptLanguage);

    await expect(getLocaleAsync()).resolves.toBe(expected);
  });
});

describe("requestConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("loads strings via import in development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const config = await invokeRequestConfig({
      requestLocale: Promise.resolve("ja"),
    });

    expect(config.locale).toBe("ja");
    expect(config.messages).toEqual({ ...en, ...ja });
    expect(fs.readFile).not.toHaveBeenCalled();
  });

  it("reads strings from disk outside development and merges over the default locale", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(fs.readFile).mockImplementation((filePath) =>
      Promise.resolve(
        typeof filePath === "string" && filePath.endsWith("ja.json")
          ? JSON.stringify({ only: "ja" })
          : JSON.stringify({ only: "en", shared: "en" }),
      ),
    );

    const config = await invokeRequestConfig({
      requestLocale: Promise.resolve("ja"),
    });

    expect(config.messages).toEqual({ only: "ja", shared: "en" });
    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringMatching(/strings[/\\]ja\.json$/),
      "utf-8",
    );
  });

  it.each([
    { expected: "ja", requestLocale: undefined },
    { expected: "en", requestLocale: "xx" },
  ])("falls back when the requested locale is $requestLocale", async ({
    expected,
    requestLocale,
  }) => {
    vi.stubEnv("NODE_ENV", "development");
    mockHeaders("ja");

    const config = await invokeRequestConfig({
      requestLocale: Promise.resolve(requestLocale),
    });

    expect(config.locale).toBe(expected);
  });
});
