"use client";

import { useTheme } from "ahooks";
import { useEffect } from "react";

export const ThemeProvider: React.FC = () => {
	const { theme } = useTheme();

	useEffect(() => {
		if (theme === "dark") {
			document.body.classList.add("dark");
		} else {
			document.body.classList.remove("dark");
		}
	}, [theme]);

	return null;
};
