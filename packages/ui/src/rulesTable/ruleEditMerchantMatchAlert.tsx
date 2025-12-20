import { Alert } from "@heroui/react";
import { useTranslations } from "next-intl";

interface Props {
	isRegexMismatch: boolean;
	merchantToMatch: string | undefined;
}

export const RuleEditMerchantMatchAlert: React.FC<Props> = ({
	isRegexMismatch,
	merchantToMatch,
}) => {
	const t = useTranslations("rules.edit");

	if (!merchantToMatch) {
		return null;
	}

	return (
		<Alert
			className="mb-4 text-sm"
			classNames={{
				mainWrapper: "ml-0! gap-2 text-sm",
				title: "font-bold",
			}}
			color={isRegexMismatch ? "danger" : undefined}
			hideIcon={true}
			title={t("basedOnTitle")}
		>
			<span className="font-mono">{merchantToMatch}</span>
			{isRegexMismatch ? (
				<span className="text-xs">{t("regexMismatch")}</span>
			) : null}
		</Alert>
	);
};
