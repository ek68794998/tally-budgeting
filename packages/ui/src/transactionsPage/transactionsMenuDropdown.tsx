"use client";

import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { IconDots, IconEdit } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { type DropdownEntry } from "../types";

export const TransactionsMenuDropdown = () => {
	const router = useRouter();
	const t = useTranslations("transactions");

	const dropdownEntries: DropdownEntry[] = useMemo(
		() => [
			{
				action: () => router.push("/transactions/rules"),
				IconComponent: IconEdit,
				key: "edit",
				label: t("rules.edit"),
			},
		],
		[router, t],
	);

	return (
		<Dropdown backdrop="opaque" placement="bottom-end">
			<DropdownTrigger>
				<Button isIconOnly={true} size="sm" variant="light">
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
