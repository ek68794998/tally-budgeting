import { isNullOrUndefined, isNumber } from "@ekumlin/typescript-toolkit/types";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import {
	Autocomplete,
	AutocompleteItem,
	type AutocompleteProps,
	AutocompleteSection,
} from "@heroui/react";
import { type Category } from "@tally/data-models/contracts/category";
import {
	DefaultSubcategoryId,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { useCallback, useMemo, useState } from "react";
import { filterMatches } from "../filter";
import { useCategories } from "../hooks/store/useCategories";

interface Props {
	autocompleteProps?: Partial<
		Omit<AutocompleteProps<CategoryItem>, "children">
	>;
	label?: string;
	onChange: (value: Subcategory) => void;
	value: Subcategory | number;
}

interface CategoryItem {
	id: number;
	label: string;
	subcategories: SubcategoryItem[];
}

interface SubcategoryItem {
	id: number;
	label: string;
}

export const SelectSubcategory: React.FC<Props> = ({
	autocompleteProps,
	label,
	onChange,
	value,
}) => {
	const { categories, subcategories } = useCategories();

	const [inputValue, setInputValue] = useState("");

	const getSubcategories = useCallback(
		(c: Category): SubcategoryItem[] =>
			subcategories
				.filter(
					(s) =>
						s.categoryId === c.id &&
						(filterMatches(inputValue, s.label) ||
							filterMatches(inputValue, c.label)),
				)
				.sort((a, b) => a.label.localeCompare(b.label)),
		[inputValue, subcategories],
	);

	const items: CategoryItem[] = useMemo(
		() =>
			categories
				.map((c) => ({
					id: c.id,
					label: c.label,
					subcategories: getSubcategories(c),
				}))
				.filter((category) => category.subcategories.length > 0)
				.sort((a, b) => a.label.localeCompare(b.label)),
		[categories, getSubcategories],
	);

	const selectedCategory = isNumber(value)
		? subcategories.find((s) => s.id === value)
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
					newValue = DefaultSubcategoryId;
				}

				const newSubcategory = subcategories.find(
					(s) => s.id === newValue,
				);
				invariant(
					newSubcategory,
					"Subcategory must be present within the data set",
				);

				onChange(newSubcategory);
				setInputValue("");
			}}
			placeholder={displayValue}
			selectedKey={selectedCategory?.id}
		>
			{(c) => (
				<AutocompleteSection
					items={c.subcategories}
					key={`category-${c.id}`}
					title={c.label}
				>
					{(i) => (
						<AutocompleteItem key={i.id}>
							{i.label}
						</AutocompleteItem>
					)}
				</AutocompleteSection>
			)}
		</Autocomplete>
	);
};
