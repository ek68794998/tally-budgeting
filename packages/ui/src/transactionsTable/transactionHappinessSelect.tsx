import { Select, SelectItem, type SelectProps } from "@heroui/react";
import {
  type Icon,
  IconMoodConfuzed,
  IconMoodSmileBeam,
} from "@tabler/icons-react";
import {
  type HappinessLevel,
  happinessLevelSchema,
} from "@tally/data-models/contracts/happinessLevel";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface HappinessOption {
  color: SelectProps["color"];
  IconComponent: Icon;
  key: HappinessLevel;
  label: string;
}

interface Props {
  onChange: (level: HappinessLevel) => void;
  value: HappinessLevel;
}

export const TransactionHappinessSelect: React.FC<Props> = ({
  onChange,
  value,
}) => {
  const t = useTranslations("transactions");

  const happinessOptions = useMemo(
    (): HappinessOption[] => [
      {
        color: "success",
        IconComponent: IconMoodSmileBeam,
        key: 3,
        label: t("happiness.level3"),
      },
      {
        color: "default",
        IconComponent: IconMoodConfuzed,
        key: 2,
        label: t("happiness.level2"),
      },
      {
        color: "danger",
        IconComponent: IconMoodConfuzed,
        key: 1,
        label: t("happiness.level1"),
      },
    ],
    [t],
  );

  return (
    <Select
      disallowEmptySelection={true}
      items={happinessOptions}
      label={t("columns.happiness")}
      onSelectionChange={({ currentKey }) => {
        if (currentKey) {
          onChange(happinessLevelSchema.parse(Number.parseInt(currentKey, 10)));
        }
      }}
      renderValue={(selected) =>
        selected[0]?.data?.label || t("happiness.level2")
      }
      selectedKeys={[value.toString()]}
    >
      {({ color, IconComponent, key, label }) => (
        <SelectItem color={color} key={key.toString()} textValue={label}>
          <div className="flex items-center gap-2">
            <IconComponent />
            {label}
          </div>
        </SelectItem>
      )}
    </Select>
  );
};
