"use client";

import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { IconCategory, IconDots, IconList } from "@tabler/icons-react";
import { web } from "@tally/utilities/routing/routeBuilder";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { type DropdownLinkEntry } from "../types";

export const TransactionsMenuDropdown = () => {
	const t = useTranslations();

	const dropdownEntries: DropdownLinkEntry[] = useMemo(
		() => [
			{
				href: web.transactions.rules,
				IconComponent: IconList,
				key: "rules",
				label: t("transactions.rules.edit"),
			},
			{
				href: web.budget.categories,
				IconComponent: IconCategory,
				key: "categories",
				label: t("budget.editCategories"),
			},
		],
		[t],
	);

	return (
		<Dropdown backdrop="opaque" placement="bottom-end">
			<DropdownTrigger>
				<Button isIconOnly={true} variant="light">
					<IconDots />
				</Button>
			</DropdownTrigger>
			<DropdownMenu items={dropdownEntries}>
				{({ href, IconComponent, key, label }) => (
					<DropdownItem
						as={NextLink}
						href={href}
						key={key}
						startContent={<IconComponent />}
					>
						{label}
					</DropdownItem>
				)}
			</DropdownMenu>
		</Dropdown>
	);
};
