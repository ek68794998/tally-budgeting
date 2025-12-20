import { toError } from "@ekumlin/typescript-toolkit/error";
import { Button, ModalFooter } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
	isSaveDisabled: boolean;
	onClose: () => void;
	onSave: () => Promise<void>;
	onSaveError: (error: Error) => void;
}

export const EditModalFooter: React.FC<Props> = ({
	isSaveDisabled,
	onClose,
	onSave,
	onSaveError,
}) => {
	const t = useTranslations();

	const [isSaving, setIsSaving] = useState(false);

	const handleClose = () => {
		setIsSaving(false);
		onClose();
	};

	return (
		<ModalFooter>
			<Button disabled={isSaving} onPress={handleClose} variant="light">
				{t("common.actions.cancel")}
			</Button>
			<Button
				color={isSaveDisabled ? undefined : "primary"}
				disabled={isSaveDisabled}
				isLoading={isSaving}
				onPress={() => {
					const callbackAsync = async () => {
						try {
							setIsSaving(true);
							await onSave();
							handleClose();
						} catch (error) {
							onSaveError(toError(error));
						} finally {
							setIsSaving(false);
						}
					};

					void callbackAsync();
				}}
				variant="solid"
			>
				{t("common.actions.save")}
			</Button>
		</ModalFooter>
	);
};
