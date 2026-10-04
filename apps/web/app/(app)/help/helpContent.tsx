import { DefaultLocale, type Locale, Locales } from "@tally/i18n/locales";
import { type MDXContent } from "mdx/types";
import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

export type HelpTopic = "assets" | "budget" | "retirement" | "transactions";

type HelpContentLoader = () => Promise<{ default: MDXContent }>;

const helpContentLoaders: Record<
  Locale,
  Record<HelpTopic, HelpContentLoader>
> = {
  en: {
    assets: () => import("./en/assets.mdx"),
    budget: () => import("./en/budget.mdx"),
    retirement: () => import("./en/retirement.mdx"),
    transactions: () => import("./en/transactions.mdx"),
  },
  ja: {
    assets: () => import("./ja/assets.mdx"),
    budget: () => import("./ja/budget.mdx"),
    retirement: () => import("./ja/retirement.mdx"),
    transactions: () => import("./ja/transactions.mdx"),
  },
};

interface Props {
  topic: HelpTopic;
}

export const HelpContent: React.FC<Props> = async ({ topic }) => {
  const requestedLocale = await getLocale();
  const t = await getTranslations("help");

  const locale = hasLocale(Locales, requestedLocale)
    ? requestedLocale
    : DefaultLocale;

  const { default: Content } = await helpContentLoaders[locale][topic]();

  return (
    <div className="flex flex-col gap-2">
      <Content />
      <div className="text-xs text-default-600">{t("aiDisclaimer")}</div>
    </div>
  );
};
