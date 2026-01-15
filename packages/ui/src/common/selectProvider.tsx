"use client";

import { Select, SelectItem, type SelectProps } from "@heroui/react";
import { type AccountProvider } from "@tally/data-models/contracts/accountProvider";
import { type AccountProviderType } from "@tally/data-models/contracts/accountProviderType";
import { AccountProviders } from "@tally/data-models/data/accountProviders";
import { DataProviderIcon } from "../dataProviderIcons/dataProviderIcon";

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
	const providers: AccountProvider[] = Object.values(AccountProviders);

	const selectedProvider = providers.find((a) => a.id === value);

	return (
		<Select
			{...selectProps}
			label={inputLabel}
			onSelectionChange={(keys) => {
				const { currentKey } = keys;
				const newProvider = providers.find(
					({ id }) => String(id) === currentKey,
				);

				if (
					newProvider?.id &&
					newProvider.id !== selectedProvider?.id
				) {
					onChange(newProvider);
				}
			}}
			selectedKeys={selectedProvider ? [String(selectedProvider.id)] : []}
		>
			{providers.map(({ id, name }) => (
				<SelectItem key={String(id)} textValue={name}>
					<div className="flex items-center gap-2">
						<DataProviderIcon provider={id} size="md" />
						<div className="flex flex-col">
							<div>{name}</div>
						</div>
					</div>
				</SelectItem>
			))}
		</Select>
	);
};
