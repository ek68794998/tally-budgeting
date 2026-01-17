import "recharts";

declare module "recharts" {
	type ValueType = number | string | readonly (number | string)[];
	type NameType = number | string;

	// Custom helper types.
	type CustomTooltipComponent = React.FC<TooltipContentProps<string, string>>;

	// From: recharts@src/component/DefaultTooltipContent.tsx
	export interface Payload<TValue extends ValueType, TName extends NameType>
		extends Omit<SVGProps<SVGElement>, "name"> {
		chartType?: string;
		className?: string;
		color?: string;
		dataKey?: DataKey<unknown>;
		fill?: string;
		formatter?: Formatter<TValue, TName>;
		graphicalItemId: string;
		hide?: boolean;
		name?: TName;
		nameKey?: DataKey<unknown>;
		payload?: unknown;
		stroke?: string;
		strokeDasharray?: string | number;
		strokeWidth?: number | string;
		type?: TooltipType;
		unit?: ReactNode;
		value?: TValue;
	}

	// From: recharts@src/component/Tooltip.tsx
	// There are more fields in this type, but they have complex data types not worth extracting.
	export interface TooltipContentProps<
		TValue extends ValueType,
		TName extends NameType,
	> {
		accessibilityLayer: boolean;
		active: boolean;
		label?: string | number;
		payload: readonly Payload<TValue, TName>[];
	}
}
