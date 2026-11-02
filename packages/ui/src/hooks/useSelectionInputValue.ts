import { useState } from "react";

interface SelectionInputValue {
  inputValue: string;
  isShowingSelection: boolean;
  resetInputValue: (label?: string) => void;
  setInputValue: (value: string) => void;
}

/**
 * Tracks a controlled autocomplete `inputValue` that mirrors the selected
 * item's label. React Aria requires this when both `inputValue` and
 * `selectedKey` are controlled; any mismatch is treated as typing and reopens
 * the menu (e.g. on blur).
 */
export const useSelectionInputValue = (
  selectedLabel: string,
): SelectionInputValue => {
  const [inputValue, setInputValue] = useState(selectedLabel);
  const [syncedLabel, setSyncedLabel] = useState(selectedLabel);

  if (syncedLabel !== selectedLabel) {
    setSyncedLabel(selectedLabel);
    setInputValue(selectedLabel);
  }

  const resetInputValue = (label = selectedLabel) => setInputValue(label);

  return {
    inputValue,
    isShowingSelection: inputValue === selectedLabel,
    resetInputValue,
    setInputValue,
  };
};
