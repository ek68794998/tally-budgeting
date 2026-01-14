"use client";

import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { type ErrorProps } from "./types";

const ErrorPage: React.FC<ErrorProps> = ({ error, reset }) => {
	const t = useTranslations("error.fullPage");

	return (
		<div className="flex flex-col items-start gap-4">
			<h1 className="text-4xl font-black">{t("title")}</h1>
			<p>{t("description")}</p>
			<pre className="max-w-96 rounded-xl border border-(--accent) p-2 text-sm">
				<div className="max-w-[inherit] overflow-auto p-2">
					{error.stack}
				</div>
			</pre>
			<div className="flex gap-4">
				<Button onPress={() => reset()}>{t("ctaReset")}</Button>
				<Button onPress={() => window.location.reload()}>
					{t("ctaReload")}
				</Button>
			</div>
		</div>
	);
};

export default ErrorPage;
