import { isNullOrUndefined, isNumber } from "@ekumlin/typescript-toolkit/types";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import {
	Autocomplete,
	AutocompleteItem,
	type AutocompleteProps,
} from "@heroui/react";
import {
	type Category,
	DefaultCategoryId,
} from "@tally/data-models/contracts/category";
import { useMemo, useState } from "react";
import { useCategories } from "../hooks/store/useCategories";

interface Props {
	autocompleteProps?: Partial<Omit<AutocompleteProps<Category>, "children">>;
	label?: string;
	onChange: (value: Category) => void;
	value: Category | number;
}

export const SelectCategory: React.FC<Props> = ({
	autocompleteProps,
	label,
	onChange,
	value,
}) => {
	const { categories } = useCategories();

	const [inputValue, setInputValue] = useState("");

	const items: Category[] = useMemo(
		() => categories.slice().sort((a, b) => a.label.localeCompare(b.label)),
		[categories],
	);

	const selectedCategory = isNumber(value)
		? categories.find((s) => s.id === value)
		: value;
	const displayValue = selectedCategory?.label;

	return (
		<Autocomplete
			{...autocompleteProps}
			inputProps={{ classNames: { input: "placeholder-current" } }}
			inputValue={inputValue}
			isClearable={false}
			items={items}
			label={label}
			onInputChange={setInputValue}
			onSelectionChange={(key) => {
				let newValue = isNullOrUndefined(key) ? NaN : Number(key);

				if (Number.isNaN(newValue)) {
					newValue = DefaultCategoryId;
				}

				const newCategory = categories.find((s) => s.id === newValue);
				invariant(
					newCategory,
					"Category must be present within the data set",
				);

				onChange(newCategory);
				setInputValue("");
			}}
			placeholder={displayValue}
			selectedKey={selectedCategory?.id}
		>
			{(c) => <AutocompleteItem key={c.id}>{c.label}</AutocompleteItem>}
		</Autocomplete>
	);
};
