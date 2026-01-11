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
	type useDisclosure,
} from "@heroui/react";
import { type Asset } from "@tally/data-models/contracts/asset";
import {
	type AssetType,
	AssetTypeKeys,
	assetTypeSchema,
} from "@tally/data-models/contracts/assetType";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { EditModalFooter } from "../modal/editModalFooter";

interface Props {
	asset: Asset | null;
	modalState: ReturnType<typeof useDisclosure>;
	onSaveAsync: (asset: Asset) => Promise<void>;
}

export const AssetEditModal: React.FC<Props> = ({
	asset,
	modalState: { isOpen, onOpenChange },
	onSaveAsync: onSave,
}) => {
	const t = useTranslations();

	const [name, setName] = useState("");
	const [type, setType] = useState<AssetType>("fixed_asset");
	const [value, setValue] = useState(0);

	const isModalOpen = isOpen && !!asset;

	const canSave = !!(name && value >= 0);

	useEffect(() => {
		if (!asset) {
			return;
		}

		setName(asset.name);
		setType(asset.type);
		setValue(Dollars.fromCents(asset.valueCents));
	}, [asset]);

	const title =
		asset?.id === -1
			? t("assets.listControls.addOne")
			: t("assets.edit", { assetName: String(asset?.name) });

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
						<ModalHeader>{title}</ModalHeader>
						<ModalBody>
							<Input
								autoFocus={true}
								label={t("assets.columns.name")}
								onValueChange={setName}
								value={name}
							/>
							<Select
								label={t("assets.columns.type")}
								onSelectionChange={(keys) => {
									const { currentKey } = keys;
									setType(assetTypeSchema.parse(currentKey));
								}}
								selectedKeys={[type]}
							>
								{AssetTypeKeys.map((typeKey) => (
									<SelectItem key={typeKey}>
										{t(`assets.types.${typeKey}`, {
											plural: "no",
										})}
									</SelectItem>
								))}
							</Select>
							<NumberInput
								label={t("assets.columns.value")}
								onValueChange={setValue}
								value={value}
							/>
						</ModalBody>
						<EditModalFooter
							isSaveDisabled={!canSave}
							onClose={onClose}
							onSave={async () => {
								invariant(asset, "Asset must be defined.");
								await onSave({
									...asset,
									name,
									type,
									valueCents: Dollars.toCents(value),
								});
							}}
							onSaveError={() =>
								addToast({
									color: "danger",
									description: "TODO",
									title: "TODO",
								})
							}
						/>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};
