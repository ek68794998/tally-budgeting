"use client";

import { toError } from "@ekumlin/typescript-toolkit/error";
import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";
import {
	addToast,
	Button,
	Checkbox,
	Link,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@heroui/react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { telemetry } from "@tally/utilities/telemetry/telemetry";
import { useTranslations } from "next-intl";
import { useState } from "react";

export type DangerousAction = "drop" | "restore";

interface Props {
	action: DangerousAction;
	isOpen: boolean;
	onClose: () => void;
	onConfirmAsync: (file: File | null) => Promise<void>;
	onDownloadBackup: () => void;
}

export const DangerousActionModal: React.FC<Props> = ({
	action,
	isOpen,
	onClose,
	onConfirmAsync,
	onDownloadBackup,
}) => {
	const t = useTranslations("settings.dangerModal");
	const [file, setFile] = useState<File | null>(null);
	const [isAcknowledged, setIsAcknowledged] = useState(false);
	const [isRunning, setIsRunning] = useState(false);

	const requiresFile = action === "restore";
	const canAcknowledge = !requiresFile || !isNullOrUndefined(file);

	const reset = () => {
		setFile(null);
		setIsAcknowledged(false);
	};

	const handleClose = () => {
		if (isRunning) {
			return;
		}

		reset();
		onClose();
	};

	const handleConfirmAsync = async () => {
		setIsRunning(true);

		try {
			await onConfirmAsync(file);
			reset();
		} catch (error) {
			addToast({
				color: "danger",
				description: toError(error).message,
				title: t("failed"),
			});
			telemetry().error("DANGEROUS_ACTION_FAILED", {
				action,
				errorMessage: toError(error).message,
			});
		} finally {
			setIsRunning(false);
		}
	};

	return (
		<Modal
			backdrop="blur"
			hideCloseButton={isRunning}
			isDismissable={!isRunning}
			isKeyboardDismissDisabled={isRunning}
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					handleClose();
				}
			}}
		>
			<ModalContent>
				<ModalHeader className="bg-danger-50 text-danger flex items-center gap-2">
					<IconAlertTriangle />
					{t(action === "restore" ? "restoreTitle" : "dropTitle")}
				</ModalHeader>
				<ModalBody className="flex flex-col gap-3">
					<p>
						{t(
							action === "restore"
								? "restoreConsequence"
								: "dropConsequence",
						)}
					</p>
					<p>{t("signedOut")}</p>
					<p>
						{t.rich("backupFirst", {
							downloadLink: (chunks) => (
								<Link
									as="button"
									className="cursor-pointer font-semibold"
									onPress={onDownloadBackup}
									size="sm"
								>
									{chunks}
								</Link>
							),
						})}
					</p>
					{requiresFile && (
						<label className="flex flex-col gap-1 text-sm">
							{t("file")}
							<input
								accept=".dump,.backup"
								data-testid="restore-file"
								onChange={(event) => {
									const chosen =
										event.target.files?.[0] ?? null;

									setFile(chosen);

									if (!chosen) {
										setIsAcknowledged(false);
									}
								}}
								type="file"
							/>
						</label>
					)}
					<Checkbox
						color="danger"
						isDisabled={!canAcknowledge || isRunning}
						isSelected={isAcknowledged}
						onValueChange={setIsAcknowledged}
					>
						{t("understand")}
					</Checkbox>
				</ModalBody>
				<ModalFooter>
					<Button isDisabled={isRunning} onPress={handleClose}>
						{t("cancel")}
					</Button>
					<Button
						color="danger"
						isDisabled={!isAcknowledged}
						isLoading={isRunning}
						onPress={() => {
							void handleConfirmAsync();
						}}
					>
						{t("confirm")}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
