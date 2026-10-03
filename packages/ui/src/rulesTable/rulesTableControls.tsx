import {
	Button,
	ButtonGroup,
	Dropdown,
	DropdownMenu,
	DropdownTrigger,
	Input,
	type Selection,
} from "@heroui/react";
import { IconDots, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { useDebounceEffect } from "ahooks";
import { Duration } from "luxon";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { renderDropdownEntry } from "../common/renderDropdownEntry";
import { type DropdownActionEntry } from "../types";

interface Props {
	displayedCount: number;
	onDelete: (selection: Selection) => void;
	onFilterChange: (value: string) => void;
	onNewRule: () => void;
	selectedRules: Selection;
}

const debounceMilliseconds = Duration.fromObject({
	milliseconds: 500,
});

export const RulesTableControls: React.FC<Props> = ({
	displayedCount,
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

	const dropdownEntries: DropdownActionEntry[] = useMemo(() => {
		const entries: DropdownActionEntry[] = [];

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
					{
						count:
							selectedRules === "all"
								? displayedCount
								: selectedRules.size,
					},
				),
			});
		}

		return entries;
	}, [displayedCount, onDelete, selectedRules, t]);

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
			</ButtonGroup>
			{dropdownEntries.length > 0 ? (
				<Dropdown backdrop="opaque" placement="bottom-end">
					<DropdownTrigger>
						<Button isIconOnly={true} variant="light">
							<IconDots />
						</Button>
					</DropdownTrigger>
					<DropdownMenu items={dropdownEntries}>
						{renderDropdownEntry}
					</DropdownMenu>
				</Dropdown>
			) : null}
		</div>
	);
};
