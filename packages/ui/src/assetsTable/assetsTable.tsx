"use client";

import { type Asset } from "@tally/data-models/contracts/asset";
import {
	type Selection,
	type SortDescriptor,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	useDisclosure,
} from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { type Key, type ReactNode, useState } from "react";
import { ModalDefaultAsset } from "../common/modalDefault";
import { formatCurrency } from "../format";
import { AssetEditModal } from "./assetEditModal";
import { AssetRowDropdown } from "./assetRowDropdown";
import { AssetsTableControls } from "./assetsTableControls";

interface Props {
	assets: Asset[];
}

export const AssetsTable: React.FC<Props> = ({ assets }) => {
	type AssetKey = keyof (typeof assets)[number];
	type ColumnKey = AssetKey | "actions";

	const editModalState = useDisclosure();
	const locale = useLocale();
	const t = useTranslations("assets");

	const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
	const [filterValue, setFilterValue] = useState("");
	const [selection, setSelection] = useState<Selection>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "name",
		direction: "ascending",
	});

	const columns: {
		key: ColumnKey;
		label: string;
	}[] = [
		{ key: "name", label: t("columns.name") },
		{ key: "value", label: t("columns.value") },
		{ key: "actions", label: "" },
	];

	const displayedAssets = assets
		.filter(
			(a) =>
				!filterValue ||
				a.name
					.toLocaleLowerCase()
					.includes(filterValue.toLocaleLowerCase()),
		)
		.sort((a, b) => {
			if (sortDescriptor.column === "name") {
				return a.name.localeCompare(b.name);
			}

			if (sortDescriptor.column === "value") {
				return a.value - b.value;
			}

			return 0;
		});

	const handleDelete = (_asset: Asset) => {
		// TODO Implement delete logic here
	};

	const handleEdit = (asset: Asset) => {
		setActiveAsset(asset);
		editModalState.onOpen();
	};

	const handleSaveAsync = (_asset: Asset) =>
		new Promise<void>((resolve) => {
			// TODO Implement save logic here
			setTimeout(() => {
				setActiveAsset(null);
				resolve();
			}, 1000);
		});

	const getRowValue = (item: Asset, key: Key): ReactNode => {
		switch (key) {
			case "name":
				return item.name;
			case "value":
				return formatCurrency(item.value, { locale });
			case "actions":
				return (
					<AssetRowDropdown
						onDelete={() => handleDelete(item)}
						onEdit={() => handleEdit(item)}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<AssetsTableControls
				onFilterChange={setFilterValue}
				onNewAsset={() => handleEdit(ModalDefaultAsset)}
			/>
			<Table
				aria-label={t("title")}
				classNames={{
					wrapper:
						"bg-background/80 dark:bg-background/20 backdrop-blur-md backdrop-saturate-150",
				}}
				onRowAction={() => "noop"}
				onSelectionChange={setSelection}
				onSortChange={setSortDescriptor}
				selectedKeys={selection}
				selectionMode="multiple"
				sortDescriptor={sortDescriptor}
			>
				<TableHeader columns={columns}>
					{(column) => (
						<TableColumn key={column.key}>
							{column.label}
						</TableColumn>
					)}
				</TableHeader>
				<TableBody items={displayedAssets}>
					{(item) => {
						const { id, name, type } = item;

						return (
							<TableRow key={`${id}-${name}-${type}`}>
								{(columnKey) => (
									<TableCell>
										{getRowValue(item, columnKey)}
									</TableCell>
								)}
							</TableRow>
						);
					}}
				</TableBody>
			</Table>
			<AssetEditModal
				asset={activeAsset}
				modalState={editModalState}
				onSaveAsync={handleSaveAsync}
			/>
		</div>
	);
};
