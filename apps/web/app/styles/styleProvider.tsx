"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider } from "./themeProvider";

type Props = React.PropsWithChildren<{
	className?: string;
}>;

export const StyleProvider: React.FC<Props> = ({ children, className }) => (
	<HeroUIProvider className={className}>
		<ThemeProvider />
		<ToastProvider placement="bottom-center" />
		{children}
	</HeroUIProvider>
);
