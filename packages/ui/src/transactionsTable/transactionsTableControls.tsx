import {
	Button,
	ButtonGroup,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Input,
	Select,
	SelectItem,
	type SharedSelection,
} from "@heroui/react";
import {
	IconFilter,
	IconPlus,
	IconSearch,
	IconUpload,
} from "@tabler/icons-react";
import { isAccount } from "@tally/data-models/data/accountHelpers";
import { web } from "@tally/utilities/routing/routeBuilder";
import { useDebounceEffect } from "ahooks";
import { Duration } from "luxon";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useAssets } from "../hooks/store/useAssets";
import { useCategories } from "../hooks/store/useCategories";
import { getTableFilterProps } from "../table/helpers";
import { TransactionsMenuDropdown } from "../transactionsPage/transactionsMenuDropdown";
import { type DropdownEntry } from "../types";
import {
	buildTransactionsFilter,
	isSelectionFilterActive,
	sortSubcategoriesForSelect,
} from "./helpers";

interface Props {
	onFilterChange: (value: string) => void;
	onNewTransaction: () => void;
}

const debounceMilliseconds = Duration.fromObject({
	milliseconds: 500,
}).toMillis();

export const TransactionsTableControls: React.FC<Props> = ({
	onFilterChange,
	onNewTransaction,
}) => {
	const { assets } = useAssets();
	const { subcategories } = useCategories();
	const t = useTranslations("transactions");

	const [accountIds, setAccountIds] = useState<SharedSelection>(new Set());
	const [subcategoryIds, setSubcategoryIds] = useState<SharedSelection>(
		new Set(),
	);
	const [searchValue, setSearchValue] = useState("");
	const [showFilters, setShowFilters] = useState(false);

	const isAccountFilterActive = isSelectionFilterActive(accountIds);
	const isSubcategoryFilterActive = isSelectionFilterActive(subcategoryIds);

	const accounts = assets.filter(isAccount);

	useDebounceEffect(
		() => {
			onFilterChange(
				buildTransactionsFilter({
					accountIds,
					searchValue,
					subcategoryIds,
				}),
			);
		},
		[accountIds, onFilterChange, searchValue, subcategoryIds],
		{ wait: debounceMilliseconds },
	);

	const dropdownEntries: DropdownEntry[] = useMemo(
		() => [
			{
				action: onNewTransaction,
				IconComponent: IconPlus,
				key: "edit",
				label: t("table.addOne"),
			},
			{
				href: web.transactions.upload,
				IconComponent: IconUpload,
				key: "upload",
				label: t("upload.action"),
			},
		],
		[onNewTransaction, t],
	);

	const sortedAccounts = useMemo(
		() => accounts.slice(0).sort((a, b) => a.name.localeCompare(b.name)),
		[accounts],
	);

	// We use a sorted subcategories list because splitting it into sections makes HeroUI completely unresponsive.
	// It appears that (at least on my machine), having more than 17 subcategories causes huge performance issues.
	// Removing the <SelectSection> code and just using a raw list of <SelectItem> works around the issue.
	const sortedSubcategories = useMemo(
		() => sortSubcategoriesForSelect(subcategories),
		[subcategories],
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between gap-2">
				<Input
					isClearable={true}
					onClear={() => setSearchValue("")}
					onValueChange={setSearchValue}
					placeholder={t("table.filterPlaceholder")}
					startContent={<IconSearch />}
					value={searchValue}
				/>
				<Button
					isIconOnly={true}
					onPress={() => setShowFilters((v) => !v)}
					variant={showFilters ? "solid" : "light"}
				>
					<IconFilter />
				</Button>
				<div className="bg-divider my-2 w-px" />
				<ButtonGroup>
					<Dropdown backdrop="opaque" placement="bottom-end">
						<DropdownTrigger>
							<Button
								startContent={<IconPlus size={16} />}
								variant="light"
							>
								{t("table.addMany")}
							</Button>
						</DropdownTrigger>
						<DropdownMenu items={dropdownEntries}>
							{(item) => {
								const {
									action,
									IconComponent,
									key,
									label,
									...entry
								} = {
									action: undefined,
									...item,
								};

								if (action) {
									entry.onPress = action;
								} else {
									entry.as = NextLink;
								}

								return (
									<DropdownItem
										key={key}
										startContent={<IconComponent />}
										{...entry}
									>
										{label}
									</DropdownItem>
								);
							}}
						</DropdownMenu>
					</Dropdown>
				</ButtonGroup>
				<div className="bg-divider my-2 w-px" />
				<TransactionsMenuDropdown />
			</div>
			{showFilters ? (
				<div className="flex flex-row justify-end gap-4">
					<Select
						{...getTableFilterProps(
							t("columns.account"),
							isAccountFilterActive,
						)}
						items={sortedAccounts}
						onSelectionChange={setAccountIds}
						renderValue={(items) =>
							t(
								isAccountFilterActive
									? "table.accountsSome"
									: "table.accountsAll",
								{ count: items.length },
							)
						}
						selectedKeys={accountIds}
					>
						{({ id, name }) => (
							<SelectItem key={id}>{name}</SelectItem>
						)}
					</Select>
					<Select
						{...getTableFilterProps(
							t("columns.category"),
							isSubcategoryFilterActive,
						)}
						items={sortedSubcategories}
						onSelectionChange={setSubcategoryIds}
						renderValue={(items) =>
							t(
								isSubcategoryFilterActive
									? "table.categoriesSome"
									: "table.categoriesAll",
								{ count: items.length },
							)
						}
						selectedKeys={subcategoryIds}
					>
						{({ id, label }) => (
							<SelectItem key={id}>{label}</SelectItem>
						)}
					</Select>
				</div>
			) : null}
		</div>
	);
};
