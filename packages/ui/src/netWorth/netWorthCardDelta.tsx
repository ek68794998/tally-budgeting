"use client";

import { DateTime } from "luxon";
import { useLocale, useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { formatCurrency } from "../format";

interface Props {
	currentDollars: number;
	previousDateIso: string;
	previousDollars: number;
}

export const NetWorthCardDelta: React.FC<Props> = ({
	currentDollars,
	previousDateIso,
	previousDollars,
}) => {
	const locale = useLocale();
	const t = useTranslations("assets.netWorth");

	const netWorthDelta = currentDollars - previousDollars;
	const netWorthDeltaColor =
		netWorthDelta > 0
			? "text-success-500"
			: netWorthDelta < 0
				? "text-danger-500"
				: "opacity-70";
	const netWorthDeltaText = formatCurrency(netWorthDelta, {
		showPlusSymbol: true,
	});

	return (
		<div
			className={twMerge(
				"font-sans text-2xl font-bold",
				netWorthDeltaColor,
			)}
		>
			{t("delta", {
				date: DateTime.fromISO(previousDateIso).toLocaleString(
					{ day: "numeric", month: "long" },
					{ locale },
				),
				delta: netWorthDeltaText,
			})}
		</div>
	);
};
