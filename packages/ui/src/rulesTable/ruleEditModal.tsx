import { invariant } from "@ekumlin/typescript-toolkit/values";
import {
	addToast,
	Checkbox,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	type useDisclosure,
} from "@heroui/react";
import { DefaultSubcategoryId } from "@tally/data-models/contracts/subcategory";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { SelectSubcategory } from "../common/selectSubcategory";
import { EditModalFooter } from "../modal/editModalFooter";
import {
	getAutoRegexStringFromMerchantName,
	getRegexFlags,
	getRegexSafe,
} from "./helpers";
import { RuleEditMerchantMatchAlert } from "./ruleEditMerchantMatchAlert";

interface Props {
	merchantToMatch?: string;
	modalState: ReturnType<typeof useDisclosure>;
	onSaveAsync: (rule: TransactionRule) => Promise<void>;
	rule: TransactionRule | null;
}

export const RuleEditModal: React.FC<Props> = ({
	merchantToMatch,
	modalState: { isOpen, onOpenChange },
	onSaveAsync: onSave,
	rule,
}) => {
	const t = useTranslations();

	const [ignoreCase, setIgnoreCase] = useState(false);
	const [isRegexDirty, setIsRegexDirty] = useState(false);
	const [merchantName, setMerchantName] = useState("");
	const [regex, setRegex] = useState("");
	const [subcategoryId, setSubcategoryId] = useState(DefaultSubcategoryId);

	const isModalOpen = isOpen && !!rule;

	useEffect(() => {
		if (!isModalOpen) {
			return;
		}

		setIgnoreCase(rule.matcher.flags.includes("i"));
		setMerchantName(rule.merchantName);
		setRegex(rule.matcher.pattern);
		setSubcategoryId(rule.subcategoryId);

		setIsRegexDirty(!!rule.matcher.pattern);
	}, [isModalOpen, rule]);

	const regexFlags = getRegexFlags({ ignoreCase });
	const regexExpression = getRegexSafe(regex, regexFlags);

	const isRegexMismatch =
		merchantToMatch && regexExpression
			? !regexExpression.exec(merchantToMatch)
			: false;

	const canSave = !!(merchantName && regexExpression);

	return (
		<Modal
			autoFocus={true}
			backdrop="blur"
			isOpen={isModalOpen}
			onOpenChange={onOpenChange}
			placement="top-center"
		>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader>
							{rule?.merchantName
								? t("rules.edit.title", {
										ruleName: String(rule.merchantName),
									})
								: t("rules.listControls.addOne")}
						</ModalHeader>
						<ModalBody>
							<RuleEditMerchantMatchAlert
								isRegexMismatch={isRegexMismatch}
								merchantToMatch={merchantToMatch}
							/>
							<SelectSubcategory
								label={t("rules.columns.category")}
								onChange={(subcategory) =>
									setSubcategoryId(subcategory.id)
								}
								value={subcategoryId}
							/>
							<Input
								label={t("rules.columns.merchant")}
								onValueChange={(value) => {
									setMerchantName(value);

									if (!isRegexDirty) {
										const autoRegex =
											getAutoRegexStringFromMerchantName(
												value,
											);
										setRegex(autoRegex);
									}
								}}
								value={merchantName}
							/>
							<Input
								classNames={{
									innerWrapper: "font-mono leading-[110%]",
								}}
								description={
									<Checkbox
										isSelected={!ignoreCase}
										onValueChange={(v) => setIgnoreCase(!v)}
										size="sm"
									>
										{t("rules.edit.regexCaseSensitive")}
									</Checkbox>
								}
								endContent={`/${regexFlags || ""}`}
								label={t("rules.columns.regex")}
								onValueChange={(value) => {
									setRegex(value);
									setIsRegexDirty(true);
								}}
								startContent={"/"}
								value={regex}
							/>
						</ModalBody>
						<EditModalFooter
							isSaveDisabled={!canSave}
							onClose={onClose}
							onSave={async () => {
								invariant(rule, "Rule must be defined.");
								await onSave({
									...rule,
									active: true,
									matcher: {
										flags: regexFlags,
										pattern: regex,
									},
									merchantName,
									subcategoryId,
								});
							}}
							onSaveError={() =>
								addToast({
									color: "danger",
									description: t("rules.edit.failureBody"),
									title: t("rules.edit.failureTitle"),
								})
							}
						/>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};
