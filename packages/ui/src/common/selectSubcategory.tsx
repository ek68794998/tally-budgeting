import { includesIgnoreCase } from "@ekumlin/typescript-toolkit/string";
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
import { useCallback, useMemo } from "react";
import { useCategories } from "../hooks/store/useCategories";
import { useSelectionInputValue } from "../hooks/useSelectionInputValue";

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

  const selectedSubcategory = isNumber(value)
    ? subcategories.find((s) => s.id === value)
    : value;
  const selectedLabel = selectedSubcategory?.label ?? "";

  const { inputValue, isShowingSelection, resetInputValue, setInputValue } =
    useSelectionInputValue(selectedLabel);

  const filterText = isShowingSelection ? "" : inputValue;

  const getSubcategories = useCallback(
    (c: Category): SubcategoryItem[] =>
      subcategories
        .filter(
          (s) =>
            s.categoryId === c.id &&
            (includesIgnoreCase(s.label, filterText) ||
              includesIgnoreCase(c.label, filterText)),
        )
        .sort((a, b) => a.label.localeCompare(b.label)),
    [filterText, subcategories],
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

  return (
    <Autocomplete
      {...autocompleteProps}
      inputValue={inputValue}
      isClearable={false}
      items={items}
      label={label}
      onInputChange={setInputValue}
      onSelectionChange={(key) => {
        // React Aria re-fires this with `null` when the menu closes while both
        // `selectedKey` and `inputValue` are controlled; ignore it so the
        // current selection isn't reset.
        if (isNullOrUndefined(key)) {
          resetInputValue();
          return;
        }

        let newValue = Number(key);

        if (Number.isNaN(newValue)) {
          newValue = DefaultSubcategoryId;
        }

        const newSubcategory = subcategories.find((s) => s.id === newValue);
        invariant(
          newSubcategory,
          "Subcategory must be present within the data set",
        );

        onChange(newSubcategory);
        resetInputValue(newSubcategory.label);
      }}
      selectedKey={
        isNullOrUndefined(selectedSubcategory)
          ? null
          : String(selectedSubcategory.id)
      }
    >
      {(c) => (
        <AutocompleteSection
          items={c.subcategories}
          key={`category-${c.id}`}
          title={c.label}
        >
          {(i) => <AutocompleteItem key={i.id}>{i.label}</AutocompleteItem>}
        </AutocompleteSection>
      )}
    </Autocomplete>
  );
};
