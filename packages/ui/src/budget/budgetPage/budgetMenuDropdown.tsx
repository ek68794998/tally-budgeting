"use client";

import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { IconCategory, IconDots } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { type DropdownEntry } from "../../types";

export const BudgetMenuDropdown = () => {
	const router = useRouter();
	const t = useTranslations("budget");

	const dropdownEntries: DropdownEntry[] = useMemo(
		() => [
			{
				action: () => router.push("/budget/categories"),
				IconComponent: IconCategory,
				key: "edit",
				label: t("editCategories"),
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
