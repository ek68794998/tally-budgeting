import { Switch } from "@heroui/react";

interface Props {
  isSelected: boolean;
  label: string;
  onValueChange: (value: boolean) => void;
}

export const SettingSwitch: React.FC<Props> = ({
  isSelected,
  label,
  onValueChange,
}) => (
  <Switch
    aria-label={label}
    isSelected={isSelected}
    onValueChange={onValueChange}
  />
);
