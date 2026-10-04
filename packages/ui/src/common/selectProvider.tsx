"use client";

import {
  Select,
  SelectItem,
  type SelectProps,
  SelectSection,
} from "@heroui/react";
import { type AccountProvider } from "@tally/data-models/contracts/accountProvider";
import { type AccountProviderType } from "@tally/data-models/contracts/accountProviderType";
import { AccountProviders } from "@tally/data-models/data/accountProviders";
import { useTranslations } from "next-intl";
import { DataProviderIcon } from "../dataProviderIcons/dataProviderIcon";
import { useSetting } from "../hooks/useSetting";
import { HiddenProviderIcon } from "./hiddenProviderIcon";
import { partitionByProviderVisibility } from "./partitionByProviderVisibility";

interface Props {
  label?: string;
  onChange: (value: AccountProvider) => void;
  selectProps?: Partial<Omit<SelectProps<AccountProvider>, "children">>;
  value: AccountProviderType | null;
}

export const SelectProvider: React.FC<Props> = ({
  label: inputLabel,
  onChange,
  selectProps,
  value,
}) => {
  const [hiddenProviders] = useSetting("providersHidden");
  const tHidden = useTranslations("settings.hiddenProviders");

  const providers: AccountProvider[] = Object.values(AccountProviders);

  const selectedProvider = providers.find((a) => a.id === value);

  const { hidden, visible } = partitionByProviderVisibility(
    providers,
    ({ id }) => id,
    hiddenProviders,
  );

  // Editing an existing account must still work, but new picks shouldn't offer a hidden provider.
  const shownHidden =
    selectedProvider && hidden.includes(selectedProvider)
      ? [selectedProvider]
      : [];

  const renderItem = ({ id, name }: AccountProvider, isHidden: boolean) => (
    <SelectItem
      className={isHidden ? "opacity-60" : undefined}
      key={String(id)}
      textValue={name}
    >
      <div className="flex items-center gap-2">
        <DataProviderIcon provider={id} size="md" />
        <div className="flex gap-1">
          {name}
          {isHidden ? <HiddenProviderIcon /> : null}
        </div>
      </div>
    </SelectItem>
  );

  return (
    <Select
      {...selectProps}
      label={inputLabel}
      onSelectionChange={(keys) => {
        const { currentKey } = keys;
        const newProvider = providers.find(
          ({ id }) => String(id) === currentKey,
        );

        if (newProvider?.id && newProvider.id !== selectedProvider?.id) {
          onChange(newProvider);
        }
      }}
      selectedKeys={selectedProvider ? [String(selectedProvider.id)] : []}
    >
      <SelectSection aria-label={inputLabel ?? "Providers"}>
        {visible.map((provider) => renderItem(provider, false))}
      </SelectSection>
      {shownHidden.length > 0 ? (
        <SelectSection title={tHidden("title")}>
          {shownHidden.map((provider) => renderItem(provider, true))}
        </SelectSection>
      ) : null}
    </Select>
  );
};
