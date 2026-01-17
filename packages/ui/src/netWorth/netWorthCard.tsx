"use client";

import { Card, CardBody } from "@heroui/react";
import { type NetWorthSnapshot } from "@tally/data-models/contracts/netWorthSnapshot";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../format";
import { NetWorthCardDelta } from "./netWorthCardDelta";

interface Props {
	className?: string;
	netWorth: number;
	previousNetWorthSnapshot: NetWorthSnapshot | undefined;
}

export const NetWorthCard: React.FC<Props> = ({
	className,
	netWorth,
	previousNetWorthSnapshot,
}) => {
	const t = useTranslations("assets.netWorth");

	const { date, valueCents: previousNetWorthCents } =
		previousNetWorthSnapshot || {};

	const previousNetWorth = Dollars.fromCents(previousNetWorthCents ?? 0);

	return (
		<Card className={className} isBlurred={true}>
			<CardBody className="flex flex-col items-center gap-4 p-8">
				<div className="font-sans text-6xl font-black">
					{formatCurrency(netWorth)}
				</div>
				{date ? (
					<NetWorthCardDelta
						currentDollars={netWorth}
						previousDateIso={date}
						previousDollars={previousNetWorth}
					/>
				) : null}
				<h2 className="text-2xl font-black">{t("title")}</h2>
			</CardBody>
		</Card>
	);
};
