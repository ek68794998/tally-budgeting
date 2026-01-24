import {
	Button,
	ButtonGroup,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Input,
	type Selection,
} from "@heroui/react";
import {
	IconChevronDown,
	IconPlus,
	IconSearch,
	IconTrash,
} from "@tabler/icons-react";
import { useDebounceEffect } from "ahooks";
import { Duration } from "luxon";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { type DropdownEntry } from "../types";

interface Props {
	onDelete: (selection: Selection) => void;
	onFilterChange: (value: string) => void;
	onNewRule: () => void;
	selectedRules: Selection;
}

const debounceMilliseconds = Duration.fromObject({
	milliseconds: 500,
});

export const RulesTableControls: React.FC<Props> = ({
	onDelete,
	onFilterChange,
	onNewRule,
	selectedRules,
}) => {
	const t = useTranslations("rules");

	const [filterValue, setFilterValue] = useState("");

	useDebounceEffect(
		() => {
			onFilterChange(filterValue);
		},
		[filterValue, onFilterChange],
		{ wait: debounceMilliseconds.toMillis() },
	);

	const dropdownEntries: DropdownEntry[] = useMemo(() => {
		const entries: DropdownEntry[] = [];

		if (selectedRules === "all" || selectedRules.size > 0) {
			entries.push({
				action: () => {
					onDelete(selectedRules);
				},
				color: "danger",
				IconComponent: IconTrash,
				key: "delete",
				label: t(
					selectedRules === "all"
						? "listControls.deleteAllTitle"
						: "listControls.deleteSelectedTitle",
				),
			});
		}

		return entries;
	}, [onDelete, selectedRules, t]);

	return (
		<div className="flex justify-between gap-4">
			<Input
				isClearable={true}
				onClear={() => setFilterValue("")}
				onValueChange={setFilterValue}
				placeholder={t("listControls.filterPlaceholder")}
				startContent={<IconSearch />}
				value={filterValue}
			/>
			<ButtonGroup>
				<Button
					className="flex-none"
					onPress={onNewRule}
					startContent={<IconPlus size={16} />}
				>
					{t("listControls.addOne")}
				</Button>
				<Dropdown backdrop="opaque" placement="bottom-end">
					<DropdownTrigger>
						<Button isIconOnly={true}>
							<IconChevronDown />
						</Button>
					</DropdownTrigger>
					<DropdownMenu items={dropdownEntries}>
						{({
							action,
							IconComponent,
							key,
							label,
							...restProps
						}) => (
							<DropdownItem
								{...restProps}
								key={key}
								onPress={action}
								startContent={<IconComponent />}
							>
								{label}
							</DropdownItem>
						)}
					</DropdownMenu>
				</Dropdown>
			</ButtonGroup>
		</div>
	);
};
