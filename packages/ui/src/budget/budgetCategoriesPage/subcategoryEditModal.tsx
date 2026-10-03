import {
	addToast,
	Checkbox,
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
	BudgetTypes,
	budgetTypeSchema,
} from "@tally/data-models/contracts/budgetType";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { useTranslations } from "next-intl";
import { SelectCategory } from "../../common/selectCategory";
import { EditModalFooter } from "../../modal/editModalFooter";
import { useSubcategoryForm } from "./hooks/useSubcategoryForm";

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
	const tError = useTranslations("error.api");

	const isModalOpen = isOpen && !!subcategory;

	const {
		budgetAmount,
		budgetFrequency,
		budgetType,
		buildSubcategory,
		canSave,
		categoryId,
		description,
		isPreTaxSavings,
		label,
		pctNeeds,
		pctSavings,
		pctWants,
		setBudgetAmount,
		setBudgetFrequency,
		setBudgetType,
		setCategoryId,
		setDescription,
		setIsPreTaxSavings,
		setLabel,
		updatePctNeeds,
		updatePctWants,
	} = useSubcategoryForm(subcategory, isModalOpen);

	const renderPercentContent = () => (
		<div className="text-xs opacity-50">{"%"}</div>
	);

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
							{budgetType === "expense" ? (
								<div className="flex justify-between gap-2">
									<NumberInput
										endContent={renderPercentContent()}
										formatOptions={{
											maximumFractionDigits: 0,
										}}
										label={t(
											"categoriesEdit.subcategoryColumns.percentNeeds",
										)}
										maxValue={100}
										minValue={0}
										onValueChange={updatePctNeeds}
										value={pctNeeds}
									/>
									<NumberInput
										endContent={renderPercentContent()}
										formatOptions={{
											maximumFractionDigits: 0,
										}}
										label={t(
											"categoriesEdit.subcategoryColumns.percentWants",
										)}
										maxValue={100}
										minValue={0}
										onValueChange={updatePctWants}
										value={pctWants}
									/>
									<NumberInput
										endContent={renderPercentContent()}
										formatOptions={{
											maximumFractionDigits: 0,
										}}
										label={t(
											"categoriesEdit.subcategoryColumns.percentSavings",
										)}
										readOnly={true}
										value={pctSavings}
									/>
								</div>
							) : budgetType === "income" ? (
								<Checkbox
									classNames={{
										label: "text-sm",
									}}
									isSelected={isPreTaxSavings}
									onValueChange={setIsPreTaxSavings}
								>
									{t(
										"categoriesEdit.subcategoryColumns.isPreTaxSavings",
									)}
								</Checkbox>
							) : null}
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
							onSave={() => onSaveAsync(buildSubcategory())}
							onSaveError={() =>
								addToast({
									color: "danger",
									description: tError("errorBody"),
									title: tError("errorTitle"),
								})
							}
						/>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};
