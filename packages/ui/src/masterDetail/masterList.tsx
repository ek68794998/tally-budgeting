import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import { type MasterProps } from "./types";

interface Props<T>
	extends Pick<
		MasterProps<T>,
		"emptyState" | "getItemGroup" | "items" | "renderItem"
	> {
	getItemKey: (item: T) => string | number;
	onSelect: (item: T) => void;
	selectedKey: string | number | null;
}

export const MasterList = <T,>({
	emptyState,
	getItemGroup,
	getItemKey,
	items,
	onSelect,
	renderItem,
	selectedKey,
}: Props<T>) => {
	const t = useTranslations("common.masterDetail");

	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center p-4">
				{emptyState ?? t("masterEmptyState")}
			</div>
		);
	}

	return (
		<ul className="flex flex-col gap-2">
			{items.map((item, index) => {
				const key = getItemKey(item);
				const isSelected = key === selectedKey;
				const group = getItemGroup?.(item);
				const previousItem = items[index - 1];
				const isGroupStart =
					!isNullOrUndefined(group) &&
					(isNullOrUndefined(previousItem) ||
						getItemGroup?.(previousItem) !== group);

				return (
					<Fragment key={key}>
						{isGroupStart && (
							<li className="px-2 pt-2 text-xs font-semibold uppercase opacity-50">
								{group}
							</li>
						)}
						<li>
							{renderItem(item, isSelected, () => onSelect(item))}
						</li>
					</Fragment>
				);
			})}
		</ul>
	);
};
