import {
	type NameType,
	type Payload,
	type ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type z from "zod";

export const getTooltipText = <T extends object>(
	value: unknown,
	tooltipData: readonly Payload<ValueType, NameType>[],
	dataSchema: z.ZodSchema<T>,
	dataKey: keyof T,
): string => {
	const text = tooltipData[0]
		? dataSchema.parse(tooltipData[0].payload)[dataKey]
		: value;

	return String(text);
};
