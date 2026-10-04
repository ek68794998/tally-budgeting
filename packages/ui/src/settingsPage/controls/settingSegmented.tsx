import { Tab, Tabs } from "@heroui/react";

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

export const SettingSegmented = <T extends string>({
  label,
  onChange,
  options,
  value,
}: Props<T>) => (
  <Tabs
    aria-label={label}
    onSelectionChange={(key) => {
      const option = options.find((o) => o.value === key);

      if (option) {
        onChange(option.value);
      }
    }}
    selectedKey={value}
    size="sm"
  >
    {options.map((option) => (
      <Tab key={option.value} title={option.label} />
    ))}
  </Tabs>
);
