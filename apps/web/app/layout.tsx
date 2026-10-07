import "./styles/globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import { getLocale } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import { twMerge } from "tailwind-merge";
import { ClientProviders } from "./clientProviders";
import { ServerProviders } from "./serverProviders";

const frankRuhlLibre = localFont({
  src: "./fonts/FrankRuhlLibreVF.ttf",
  variable: "--font-frank-ruhl-libre",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  description: "tally – Budgeting App",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon.ico" },
      { sizes: "16x16", type: "image/png", url: "/favicon-16x16.png" },
      { sizes: "32x32", type: "image/png", url: "/favicon-32x32.png" },
    ],
  },
  manifest: "/site.webmanifest",
  title: "tally",
};

const RootLayout: React.FC<React.PropsWithChildren> = async ({ children }) => {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={twMerge(
          "flex flex-col",
          geistSans.variable,
          geistMono.variable,
          frankRuhlLibre.variable,
        )}
      >
        <ServerProviders locale={locale}>
          <ClientProviders>
            <NextTopLoader
              color="hsl(var(--heroui-primary-500))"
              showSpinner={false}
            />
            {children}
          </ClientProviders>
        </ServerProviders>
      </body>
    </html>
  );
};

export default RootLayout;
