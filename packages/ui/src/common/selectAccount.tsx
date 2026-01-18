"use client";

import { isNumber } from "@ekumlin/typescript-toolkit/types";
import { Select, SelectItem, type SelectProps } from "@heroui/react";
import { type Asset } from "@tally/data-models/contracts/asset";
import { AccountProviders } from "@tally/data-models/data/accountProviders";
import { DataProviderIcon } from "../dataProviderIcons/dataProviderIcon";
import { useAssets } from "../hooks/store/useAssets";

interface Props {
	label?: string;
	onChange: (value: Asset) => void;
	selectProps?: Partial<Omit<SelectProps<Asset>, "children">>;
	showOnlyWithProvider?: boolean;
	value: Asset | number | undefined;
}

export const SelectAccount: React.FC<Props> = ({
	label: inputLabel,
	onChange,
	selectProps,
	showOnlyWithProvider = false,
	value,
}) => {
	const { assets } = useAssets();

	const availableAccounts = assets
		.filter(({ provider }) => !showOnlyWithProvider || !!provider)
		.sort((a, b) => a.name.localeCompare(b.name));

	const selectedAccount = isNumber(value)
		? availableAccounts.find((a) => a.id === value)
		: value;

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
			{availableAccounts.map(({ id, name, provider }) => (
				<SelectItem key={String(id)} textValue={name}>
					<div className="flex items-center gap-2">
						<DataProviderIcon provider={provider} size="md" />
						<div className="flex flex-col">
							<div>{name}</div>
							{provider ? (
								<div className="text-xs opacity-50">
									{AccountProviders[provider].name}
								</div>
							) : null}
						</div>
					</div>
				</SelectItem>
			))}
		</Select>
	);
};
