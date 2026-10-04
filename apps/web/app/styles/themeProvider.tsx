"use client";

import { useSetting } from "@tally/ui/hooks/useSetting";
import { useTheme } from "ahooks";
import { useEffect } from "react";

export const ThemeProvider: React.FC = () => {
	const [themeSetting] = useSetting("displayTheme");
	const { setThemeMode, theme } = useTheme();

	// The setting is the single source of truth; ahooks only resolves "system" to light or dark.
	useEffect(() => {
		setThemeMode(themeSetting);
	}, [setThemeMode, themeSetting]);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	return null;
};
