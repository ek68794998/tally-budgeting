"use client";

import { Card, CardBody } from "@heroui/react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../format";

interface Props {
	className?: string;
	netWorth: number;
}

export const NetWorthCard: React.FC<Props> = ({ className, netWorth }) => {
	const t = useTranslations("netWorth");

	return (
		<Card className={className} isBlurred={true}>
			<CardBody className="flex flex-col items-center gap-4 p-8">
				<div className="font-sans text-6xl font-black">
					{formatCurrency(netWorth)}
				</div>
				<h2 className="text-2xl font-black">{t("title")}</h2>
			</CardBody>
		</Card>
	);
};
