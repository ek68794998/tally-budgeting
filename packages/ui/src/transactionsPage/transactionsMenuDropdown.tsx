"use client";

import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { IconCategory, IconDots, IconList } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { type DropdownEntry } from "../types";

export const TransactionsMenuDropdown = () => {
	const router = useRouter();
	const t = useTranslations();

	const dropdownEntries: DropdownEntry[] = useMemo(
		() => [
			{
				action: () => router.push("/transactions/rules"),
				IconComponent: IconList,
				key: "rules",
				label: t("transactions.rules.edit"),
			},
			{
				action: () => router.push("/budget/categories"),
				IconComponent: IconCategory,
				key: "categories",
				label: t("budget.editCategories"),
			},
		],
		[router, t],
	);

	return (
		<Dropdown backdrop="opaque" placement="bottom-end">
			<DropdownTrigger>
				<Button isIconOnly={true} variant="light">
					<IconDots />
				</Button>
			</DropdownTrigger>
			<DropdownMenu items={dropdownEntries}>
				{({ action, IconComponent, key, label }) => (
					<DropdownItem
						key={key}
						onPress={action}
						startContent={<IconComponent />}
					>
						{label}
					</DropdownItem>
				)}
			</DropdownMenu>
		</Dropdown>
	);
};
