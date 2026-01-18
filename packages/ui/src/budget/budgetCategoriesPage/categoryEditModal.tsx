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
import { type Category } from "@tally/data-models/contracts/category";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { EditModalFooter } from "../../modal/editModalFooter";

interface Props {
	category: Category | null;
	modalState: ReturnType<typeof useDisclosure>;
	onSaveAsync: (category: Category) => Promise<void>;
}

export const CategoryEditModal: React.FC<Props> = ({
	category,
	modalState: { isOpen, onOpenChange },
	onSaveAsync,
}) => {
	const t = useTranslations();

	const [label, setLabel] = useState("");

	const isModalOpen = isOpen && !!category;

	const canSave = !!label;

	useEffect(() => {
		if (!isModalOpen) {
			return;
		}

		setLabel(category.label);
	}, [category, isModalOpen]);

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
							{category?.label
								? t("budget.categoriesEdit.editCategory", {
										label: category.label,
									})
								: t("budget.categoriesEdit.newCategory")}
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
									category,
									"Category must be defined.",
								);
								await onSaveAsync({
									...category,
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
