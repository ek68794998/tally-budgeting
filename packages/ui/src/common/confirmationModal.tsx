import { toError } from "@ekumlin/typescript-toolkit/error";
import {
	addToast,
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	type useDisclosure,
} from "@heroui/react";
import { telemetry } from "@tally/utilities/telemetry/telemetry";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
	body: React.ReactNode;
	cancelText?: string;
	confirmText?: string;
	isDestructive?: boolean;
	modalState: ReturnType<typeof useDisclosure>;
	onConfirmAsync: () => Promise<void>;
	title: string;
}

export const ConfirmationModal: React.FC<Props> = ({
	body,
	cancelText,
	confirmText,
	isDestructive,
	modalState: { isOpen, onOpenChange },
	onConfirmAsync,
	title,
}) => {
	const t = useTranslations();
	const [isConfirming, setIsConfirming] = useState(false);

	const confirmAsync = async (onClose: () => void) => {
		setIsConfirming(true);

		try {
			await onConfirmAsync();
			onClose();
		} catch (error) {
			addToast({
				color: "danger",
				description: t("error.api.errorBody"),
				title: t("error.api.errorTitle"),
			});

			telemetry().error("CONFIRMATION_ACTION_FAILED", {
				errorMessage: toError(error).message,
			});
		} finally {
			setIsConfirming(false);
		}
	};

	return (
		<Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader>{title}</ModalHeader>
						<ModalBody className="block">{body}</ModalBody>
						<ModalFooter>
							<Button onPress={onClose}>
								{cancelText || t("common.actions.cancel")}
							</Button>
							<Button
								color={isDestructive ? "danger" : "primary"}
								isLoading={isConfirming}
								onPress={() => {
									void confirmAsync(onClose);
								}}
							>
								{confirmText || t("common.actions.ok")}
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};
