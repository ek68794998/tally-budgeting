"use client";

import { addToast, Button, Card, CardBody } from "@heroui/react";
import { buildWebRoute, web } from "@tally/utilities/routing/routeBuilder";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useBackupDownload } from "../../hooks/api/useBackupDownload";
import { useDatabaseActions } from "../../hooks/api/useDatabaseActions";
import {
  type DangerousAction,
  DangerousActionModal,
} from "../dangerousActionModal";

interface ActionRowProps {
  buttonLabel: string;
  description: string;
  isLoading?: boolean;
  onPress?: () => void;
  title: string;
  variant: "danger" | "default";
}

const ActionRow: React.FC<ActionRowProps> = ({
  buttonLabel,
  description,
  isLoading,
  onPress,
  title,
  variant,
}) => (
  <div className="flex items-center justify-between gap-4 py-2">
    <div className="flex flex-col">
      <span className="font-semibold">{title}</span>
      <span className="text-sm opacity-60">{description}</span>
    </div>
    <Button
      color={variant === "danger" ? "danger" : "primary"}
      isLoading={isLoading}
      onPress={onPress}
      variant={variant === "danger" ? "bordered" : "solid"}
    >
      {buttonLabel}
    </Button>
  </div>
);

export const DataSection: React.FC = () => {
  const t = useTranslations("settings.data");
  const tModal = useTranslations("settings.dangerModal");
  const { dropAsync, restoreAsync } = useDatabaseActions();
  const { downloadBackupAsync, isDownloading } = useBackupDownload();
  const [action, setAction] = useState<DangerousAction | null>(null);

  const handleConfirmAsync = async (file: File | null) => {
    await (action === "restore" && file ? restoreAsync(file) : dropAsync());

    addToast({
      color: "success",
      title: tModal(action === "restore" ? "restoreSuccess" : "dropSuccess"),
    });

    // Both actions replace the session secret, so a full navigation to the login page is required.
    window.location.assign(buildWebRoute(web.login));
  };

  return (
    <div className="flex flex-col gap-6">
      <Card isBlurred={true}>
        <CardBody>
          <ActionRow
            buttonLabel={t("backup.button")}
            description={t("backup.description")}
            isLoading={isDownloading}
            onPress={() => {
              void downloadBackupAsync();
            }}
            title={t("backup.title")}
            variant="default"
          />
        </CardBody>
      </Card>
      <Card
        className="
          border-danger bg-danger-50
          dark:bg-danger-50/10
          border-2
        "
      >
        <CardBody className="gap-2">
          <h3 className="text-danger font-semibold">{t("dangerZone.title")}</h3>
          <ActionRow
            buttonLabel={t("restore.button")}
            description={t("restore.description")}
            onPress={() => setAction("restore")}
            title={t("restore.title")}
            variant="danger"
          />
          <ActionRow
            buttonLabel={t("drop.button")}
            description={t("drop.description")}
            onPress={() => setAction("drop")}
            title={t("drop.title")}
            variant="danger"
          />
        </CardBody>
      </Card>
      <DangerousActionModal
        action={action ?? "drop"}
        isOpen={!!action}
        onClose={() => setAction(null)}
        onConfirmAsync={handleConfirmAsync}
        onDownloadBackup={() => {
          void downloadBackupAsync();
        }}
      />
    </div>
  );
};
