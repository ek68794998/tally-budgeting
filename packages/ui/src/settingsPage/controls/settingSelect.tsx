import { Select, SelectItem } from "@heroui/react";

interface Option<T extends string> {
	label: string;
	value: T;
}

interface Props<T extends string> {
	label: string;
	onChange: (value: T) => void;
	options: Option<T>[];
	value: T;
}

export const SettingSelect = <T extends string>({
	label,
	onChange,
	options,
	value,
}: Props<T>) => (
	<Select
		aria-label={label}
		className="w-48"
		onSelectionChange={({ currentKey }) => {
			const option = options.find((o) => o.value === currentKey);

			if (option) {
				onChange(option.value);
			}
		}}
		selectedKeys={[value]}
		size="sm"
	>
		{options.map(({ label: optionLabel, value: optionValue }) => (
			<SelectItem key={optionValue}>{optionLabel}</SelectItem>
		))}
	</Select>
);
