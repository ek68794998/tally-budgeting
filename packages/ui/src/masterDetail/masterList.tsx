import { useTranslations } from "next-intl";
import { type MasterProps } from "./types";

interface Props<T>
	extends Pick<MasterProps<T>, "emptyState" | "items" | "renderItem"> {
	getItemKey: (item: T) => string | number;
	onSelect: (item: T) => void;
	selectedKey: string | number | null;
}

export const MasterList = <T,>({
	emptyState,
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
			{items.map((item) => {
				const key = getItemKey(item);
				const isSelected = key === selectedKey;

				return (
					<li key={key}>
						{renderItem(item, isSelected, () => onSelect(item))}
					</li>
				);
			})}
		</ul>
	);
};
