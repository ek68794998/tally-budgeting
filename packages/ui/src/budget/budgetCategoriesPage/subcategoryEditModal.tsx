import { invariant } from "@ekumlin/typescript-toolkit/values";
import {
	addToast,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	type useDisclosure,
} from "@heroui/react";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { EditModalFooter } from "../../modal/editModalFooter";

interface Props {
	modalState: ReturnType<typeof useDisclosure>;
	onSaveAsync: (subcategory: Subcategory) => Promise<void>;
	subcategory: Subcategory | null;
}

export const SubcategoryEditModal: React.FC<Props> = ({
	modalState: { isOpen, onOpenChange },
	onSaveAsync,
	subcategory,
}) => {
	const t = useTranslations();

	const [label, setLabel] = useState("");

	const isModalOpen = isOpen && !!subcategory;

	const canSave = !!label;

	useEffect(() => {
		if (!isModalOpen) {
			return;
		}

		setLabel(subcategory.label);
	}, [isModalOpen, subcategory]);

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
							{subcategory?.label
								? t("budget.categoriesEdit.editSubcategory", {
										label: subcategory.label,
									})
								: t("budget.categoriesEdit.newSubcategory")}
						</ModalHeader>
						<ModalBody>
							<Input
								label={t(
									"budget.categoriesEdit.categoryColumns.label",
								)}
								onValueChange={setLabel}
								value={label}
							/>
						</ModalBody>
						<EditModalFooter
							isSaveDisabled={!canSave}
							onClose={onClose}
							onSave={async () => {
								invariant(
									subcategory,
									"Subcategory must be defined.",
								);
								await onSaveAsync({
									...subcategory,
									label,
								});
							}}
							onSaveError={() =>
								addToast({
									color: "danger",
									description: "Failed" /* TODO */,
									title: "Failed" /* TODO */,
								})
							}
						/>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};
