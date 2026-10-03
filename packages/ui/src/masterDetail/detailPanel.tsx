import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";
import { twMerge } from "tailwind-merge";
import { DetailEmptyState } from "./detailEmptyState";
import { DetailHeader } from "./detailHeader";
import { type DetailProps } from "./types";

interface Props<T> extends DetailProps<T> {
	className?: string;
	masterTitle: string;
	onBack: () => void;
	selectedItem: T | null;
	selectedKey: string | number | null;
}

export const DetailPanel = <T,>({
	actions,
	className,
	content,
	emptyState,
	masterTitle,
	onBack,
	selectedItem,
	selectedKey,
	title,
}: Props<T>) => {
	const actionsNode = actions && selectedItem ? actions(selectedItem) : null;

	return (
		<div
			className={twMerge(
				isNullOrUndefined(selectedKey)
					? `
						mt-3 hidden
						@xl:block
					`
					: "block",
				className,
			)}
		>
			{selectedItem ? (
				<DetailHeader
					actions={actionsNode}
					masterTitle={masterTitle}
					onBack={onBack}
					title={title?.(selectedItem)}
				/>
			) : null}

			<div>
				{selectedItem
					? content(selectedItem)
					: (emptyState ?? <DetailEmptyState />)}
			</div>
		</div>
	);
};
