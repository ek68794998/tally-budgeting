import { invariant } from "@ekumlin/typescript-toolkit/values";
import {
	addToast,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	NumberInput,
	Select,
	SelectItem,
	Textarea,
	type useDisclosure,
} from "@heroui/react";
import {
	type BudgetType,
	BudgetTypes,
	budgetTypeSchema,
} from "@tally/data-models/contracts/budgetType";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { SelectCategory } from "../../common/selectCategory";
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
	const t = useTranslations("budget");

	const [budgetAmount, setBudgetAmount] = useState(0);
	const [budgetFrequency, setBudgetFrequency] = useState(1);
	const [budgetType, setBudgetType] = useState<BudgetType>("expense");
	const [categoryId, setCategoryId] = useState(DefaultCategoryId);
	const [description, setDescription] = useState("");
	const [label, setLabel] = useState("");

	const isModalOpen = isOpen && !!subcategory;

	const canSave = !!label;

	useEffect(() => {
		if (!isModalOpen) {
			return;
		}

		setBudgetAmount(Dollars.fromCents(subcategory.budget.amountCents));
		setBudgetFrequency(subcategory.budget.frequency);
		setBudgetType(subcategory.budget.type);
		setCategoryId(subcategory.categoryId);
		setDescription(subcategory.description);
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
								? t("categoriesEdit.editSubcategory", {
										label: subcategory.label,
									})
								: t("categoriesEdit.newSubcategory")}
						</ModalHeader>
						<ModalBody>
							<Input
								label={t(
									"categoriesEdit.categoryColumns.label",
								)}
								onValueChange={setLabel}
								value={label}
							/>
							<SelectCategory
								label={t(
									"categoriesEdit.subcategoryColumns.categoryId",
								)}
								onChange={(category) =>
									setCategoryId(category.id)
								}
								value={categoryId}
							/>
							<Select
								label={t(
									"categoriesEdit.subcategoryColumns.budgetType",
								)}
								onSelectionChange={(keys) => {
									const { currentKey } = keys;
									setBudgetType(
										budgetTypeSchema.parse(currentKey),
									);
								}}
								selectedKeys={[budgetType]}
							>
								{BudgetTypes.map((typeKey) => (
									<SelectItem key={typeKey}>
										{t(`types.${typeKey}`)}
									</SelectItem>
								))}
							</Select>
							<NumberInput
								formatOptions={{
									currency: "USD",
									maximumFractionDigits: 2,
									style: "currency",
								}}
								label={t(
									"categoriesEdit.subcategoryColumns.budgetAmount",
								)}
								minValue={0}
								onValueChange={setBudgetAmount}
								value={budgetAmount}
							/>
							<NumberInput
								formatOptions={{
									style: "unit",
									unit: "month",
									unitDisplay: "long",
								}}
								label={t(
									"categoriesEdit.subcategoryColumns.budgetFrequency",
								)}
								maxValue={12}
								minValue={1}
								onValueChange={setBudgetFrequency}
								value={budgetFrequency}
							/>
							<Textarea
								label={t(
									"categoriesEdit.subcategoryColumns.description",
								)}
								onValueChange={setDescription}
								rows={3}
								value={description}
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
									budget: {
										amountCents:
											Dollars.toCents(budgetAmount),
										frequency: budgetFrequency,
										type: budgetType,
									},
									categoryId,
									description,
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
