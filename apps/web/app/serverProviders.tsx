import { type Locale } from "@tally/i18n/locales";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

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
			{children}
		</NextIntlClientProvider>
	);
};
