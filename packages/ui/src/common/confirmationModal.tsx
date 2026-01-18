import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	type useDisclosure,
} from "@heroui/react";
import { useTranslations } from "next-intl";

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
								onPress={() => {
									void onConfirmAsync();
									onClose();
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
