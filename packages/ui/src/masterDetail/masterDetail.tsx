import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { DetailPanel } from "./detailPanel";
import { MasterPanel } from "./masterPanel";
import type { MasterDetailProps } from "./types";

export const MasterDetail = <T,>({
	classNames,
	defaultSelectedKey,
	detail,
	getItemKey,
	master,
	onSelectionChange,
}: MasterDetailProps<T>) => {
	const {
		container: className,
		detail: detailClassName,
		master: masterClassName,
	} = classNames ?? {};

	const {
		actions: detailActions,
		content: detailContent,
		emptyState: detailEmptyState,
		title: detailTitle,
	} = detail;

	const {
		actions: masterActions,
		emptyState: masterEmptyState,
		items: masterItems,
		renderItem: masterRenderItem,
		title: masterTitle,
	} = master;

	const [selectedKey, setSelectedKey] = useState<string | number | null>(
		() => {
			const firstItem = masterItems[0];
			return (
				defaultSelectedKey ?? (firstItem ? getItemKey(firstItem) : null)
			);
		},
	);

	const selectedItem =
		masterItems.find((item) => getItemKey(item) === selectedKey) ?? null;

	const handleSelect = (item: T) => {
		const key = getItemKey(item);
		setSelectedKey(key);
		onSelectionChange?.(item);
	};

	const handleBack = () => {
		setSelectedKey(null);
		onSelectionChange?.(null);
	};

	return (
		<div className={twMerge("@container", className)}>
			<div
				className="
					grid grid-cols-1 gap-6
					@xl:grid-cols-[300px_1fr]
				"
			>
				<MasterPanel
					actions={masterActions}
					className={masterClassName}
					emptyState={masterEmptyState}
					getItemKey={getItemKey}
					items={masterItems}
					onSelect={handleSelect}
					renderItem={masterRenderItem}
					selectedKey={selectedKey}
					title={masterTitle}
				/>
				<DetailPanel
					actions={detailActions}
					className={detailClassName}
					content={detailContent}
					emptyState={detailEmptyState}
					masterTitle={masterTitle}
					onBack={handleBack}
					selectedItem={selectedItem}
					selectedKey={selectedKey}
					title={detailTitle}
				/>
			</div>
		</div>
	);
};
