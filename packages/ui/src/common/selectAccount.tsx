"use client";

import { isNumber } from "@ekumlin/typescript-toolkit/types";
import {
	Select,
	SelectItem,
	type SelectProps,
	SelectSection,
} from "@heroui/react";
import { type Asset } from "@tally/data-models/contracts/asset";
import { AccountProviders } from "@tally/data-models/data/accountProviders";
import { useTranslations } from "next-intl";
import { DataProviderIcon } from "../dataProviderIcons/dataProviderIcon";
import { useAssets } from "../hooks/store/useAssets";
import { useSetting } from "../hooks/useSetting";
import { HiddenProviderIcon } from "./hiddenProviderIcon";
import { partitionByProviderVisibility } from "./partitionByProviderVisibility";

interface Props {
	label?: string;
	onChange: (value: Asset) => void;
	selectProps?: Partial<Omit<SelectProps<Asset>, "children">>;
	showInactive?: boolean;
	showOnlyWithProvider?: boolean;
	value: Asset | number | undefined;
}

export const SelectAccount: React.FC<Props> = ({
	label: inputLabel,
	onChange,
	selectProps,
	showInactive = false,
	showOnlyWithProvider = false,
	value,
}) => {
	const { assets } = useAssets();
	const [hiddenProviders] = useSetting("providersHidden");
	const tHidden = useTranslations("settings.hiddenProviders");

	const availableAccounts = assets
		.filter(({ active, provider }) => {
			if (!showInactive && !active) {
				return false;
			}

			return !showOnlyWithProvider || !!provider;
		})
		.sort((a, b) => a.name.localeCompare(b.name));

	// Always shown: uploading or editing transactions for an old account is legitimate.
	const { hidden: hiddenAccounts, visible: visibleAccounts } =
		partitionByProviderVisibility(
			availableAccounts,
			({ provider }) => provider,
			hiddenProviders,
		);

	const selectedAccount = isNumber(value)
		? availableAccounts.find((a) => a.id === value)
		: value;

	const renderItem = ({ id, name, provider }: Asset, isHidden: boolean) => (
		<SelectItem
			className={isHidden ? "opacity-60" : undefined}
			key={String(id)}
			textValue={name}
		>
			<div className="flex items-center gap-2">
				<DataProviderIcon provider={provider} size="md" />
				<div className="flex flex-col">
					<div className="flex gap-1">
						{name}
						{isHidden ? <HiddenProviderIcon /> : null}
					</div>
					{provider ? (
						<div className="text-xs opacity-50">
							{AccountProviders[provider].name}
						</div>
					) : null}
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
				const newAccount = availableAccounts.find(
					({ id }) => String(id) === currentKey,
				);

				if (newAccount?.id && newAccount.id !== selectedAccount?.id) {
					onChange(newAccount);
				}
			}}
			selectedKeys={selectedAccount ? [String(selectedAccount.id)] : []}
		>
			<SelectSection aria-label={inputLabel ?? "Accounts"}>
				{visibleAccounts.map((account) => renderItem(account, false))}
			</SelectSection>
			{hiddenAccounts.length > 0 ? (
				<SelectSection title={tHidden("title")}>
					{hiddenAccounts.map((account) => renderItem(account, true))}
				</SelectSection>
			) : null}
		</Select>
	);
};
