import { dangerouslyCoerceType } from "@ekumlin/typescript-toolkit/testing";
import { type Locale, Locales } from "@tally/i18n/locales";
import { render, screen } from "@testing-library/react";
import { getLocale } from "next-intl/server";
import { describe, expect, it, vi } from "vitest";
import { HelpContent, type HelpTopic } from "./helpContent";

vi.mock("next-intl", () => ({
  hasLocale: (locales: readonly string[], locale: string) =>
    locales.includes(locale),
}));
vi.mock("next-intl/server", () => ({
  getLocale: vi.fn(),
  getTranslations: () => Promise.resolve((key: string) => key),
}));

const createMdxModule = (text: string) => ({ default: () => <p>{text}</p> });

vi.mock("./en/assets.mdx", () => createMdxModule("en assets"));
vi.mock("./en/budget.mdx", () => createMdxModule("en budget"));
vi.mock("./en/retirement.mdx", () => createMdxModule("en retirement"));
vi.mock("./en/transactions.mdx", () => createMdxModule("en transactions"));
vi.mock("./ja/assets.mdx", () => createMdxModule("ja assets"));
vi.mock("./ja/budget.mdx", () => createMdxModule("ja budget"));
vi.mock("./ja/retirement.mdx", () => createMdxModule("ja retirement"));
vi.mock("./ja/transactions.mdx", () => createMdxModule("ja transactions"));

const topics: HelpTopic[] = ["assets", "budget", "retirement", "transactions"];

describe("HelpContent", () => {
  it.each(
    Locales.flatMap((locale) => topics.map((topic) => ({ locale, topic }))),
  )("renders the $locale help for $topic with the AI disclaimer", async ({
    locale,
    topic,
  }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);

    render(await HelpContent({ topic }));

    expect(screen.getByText(`${locale} ${topic}`)).toBeInTheDocument();
    expect(screen.getByText("aiDisclaimer")).toBeInTheDocument();
  });

  it("falls back to the default locale", async () => {
    vi.mocked(getLocale).mockResolvedValue(dangerouslyCoerceType<Locale>("fr"));

    render(await HelpContent({ topic: "budget" }));

    expect(screen.getByText("en budget")).toBeInTheDocument();
  });
});
