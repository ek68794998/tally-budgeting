export interface ClassNameProps {
	container?: string;
	detail?: string;
	master?: string;
}

export interface DetailProps<T> {
	actions?: (item: T) => React.ReactNode;
	content: (selectedItem: T | null) => React.ReactNode;
	emptyState?: React.ReactNode;
	title?: (selectedItem: T | null) => string;
}

export interface MasterProps<T> {
	actions?: React.ReactNode;
	emptyState?: React.ReactNode;
	/** When given, the list shows a heading wherever the group of consecutive items changes. */
	getItemGroup?: (item: T) => string;
	items: T[];
	renderItem: (
		item: T,
		isSelected: boolean,
		onClick: () => void,
	) => React.ReactNode;
	title: string;
}

export interface MasterDetailProps<T> {
	classNames?: ClassNameProps;
	defaultSelectedKey?: string | number;
	detail: DetailProps<T>;
	getItemKey: (item: T) => string | number;
	master: MasterProps<T>;
	onSelectionChange?: (item: T | null) => void;
}
