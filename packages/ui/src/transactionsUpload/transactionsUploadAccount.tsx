"use client";

import { AccountProviders } from "@tally/data-models/data/accountProviders";
import { useTranslations } from "next-intl";
import { SelectAccount } from "../common/selectAccount";
import { useTransactionsUploadContext } from "./transactionsUploadProvider";

export const TransactionsUploadAccount: React.FC = () => {
	const { account, setAccount } = useTransactionsUploadContext();
	const t = useTranslations("transactions");

	const accountProvider =
		account?.provider && AccountProviders[account.provider];

	const descriptionText = accountProvider
		? t.rich("upload.selectedProvider", {
				bold: (chunks) => <b>{chunks}</b>,
				provider: accountProvider.name,
			})
		: t("upload.selectAccount");

	return (
		<div>
			<SelectAccount
				onChange={setAccount}
				selectProps={{
					description: descriptionText,
					size: "lg",
				}}
				showOnlyWithProvider={true}
				value={account?.id}
			/>
		</div>
	);
};
