import { type SharedSelection } from "@heroui/react";
import { vi } from "vitest";

export const buildSelection = (key: string): SharedSelection =>
	Object.assign(new Set([key]), { anchorKey: key, currentKey: key });

interface CollectionProps {
	children?: React.ReactNode | ((item: unknown) => React.ReactNode);
	items?: Iterable<unknown>;
	label?: React.ReactNode;
	onSelectionChange?: (keys: SharedSelection) => void;
}

interface ItemProps {
	children?: React.ReactNode;
	href?: string;
	onPress?: () => void;
	startContent?: React.ReactNode;
}

const renderCollection = ({ children, items }: CollectionProps) =>
	typeof children === "function"
		? [...(items ?? [])].map((item) => children(item))
		: children;

/** Lightweight stand-ins for HeroUI collection components, whose popovers react-aria cannot open in happy-dom. */
export const heroUiCollectionStubs = {
	Autocomplete: vi.fn((props: CollectionProps) => (
		<div data-testid="autocomplete">
			{props.label}
			{renderCollection(props)}
		</div>
	)),
	AutocompleteItem: vi.fn(({ children }: ItemProps) => <div>{children}</div>),
	AutocompleteSection: vi.fn((props: CollectionProps) => (
		<div>{renderCollection(props)}</div>
	)),
	Dropdown: vi.fn(({ children }: React.PropsWithChildren) => (
		<div>{children}</div>
	)),
	DropdownItem: vi.fn(
		({ children, href, onPress, startContent }: ItemProps) => (
			<button
				data-href={href}
				data-testid="dropdown-item"
				onClick={onPress}
				type="button"
			>
				{startContent}
				{children}
			</button>
		),
	),
	DropdownMenu: vi.fn((props: CollectionProps) => (
		<div>{renderCollection(props)}</div>
	)),
	DropdownTrigger: vi.fn(({ children }: React.PropsWithChildren) => (
		<div>{children}</div>
	)),
	Select: vi.fn((props: CollectionProps) => (
		<div data-testid="select">
			{props.label}
			{renderCollection(props)}
		</div>
	)),
	SelectItem: vi.fn(({ children }: ItemProps) => <div>{children}</div>),
	SelectSection: vi.fn((props: CollectionProps & { title?: string }) => (
		<section aria-label={props.title} data-testid="select-section">
			{props.title}
			{renderCollection(props)}
		</section>
	)),
};

/** Use as `vi.mock("@heroui/react", async (importOriginal) => (await import("../testing/heroUi.js")).withHeroUiStubs(importOriginal))`. */
export const withHeroUiStubs = async (
	importOriginal: <T>() => Promise<T>,
): Promise<Record<string, unknown>> => ({
	...(await importOriginal<Record<string, unknown>>()),
	...heroUiCollectionStubs,
});
