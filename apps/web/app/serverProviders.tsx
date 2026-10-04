import { type Locale } from "@tally/i18n/locales";
import { AuthProvider } from "@tally/ui/auth/authContext";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getAuthConfig } from "./auth/config";

type Props = React.PropsWithChildren<{
  locale: Locale;
}>;

export const ServerProviders: React.FC<Props> = async ({
  children,
  locale,
}) => {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider isAuthEnabled={getAuthConfig().mode === "password"}>
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  );
};
