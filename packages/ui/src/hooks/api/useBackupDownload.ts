import { toError } from "@ekumlin/typescript-toolkit/error";
import { addToast } from "@heroui/react";
import { telemetry } from "@tally/utilities/telemetry/telemetry";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useDatabaseActions } from "./useDatabaseActions";

export const useBackupDownload = () => {
	const t = useTranslations("settings.data.backup");
	const { backupAsync } = useDatabaseActions();
	const [isDownloading, setIsDownloading] = useState(false);

	const downloadBackupAsync = useCallback(async () => {
		setIsDownloading(true);

		try {
			await backupAsync();
		} catch (error) {
			addToast({
				color: "danger",
				description: toError(error).message,
				title: t("failed"),
			});
			telemetry().error("DATABASE_BACKUP_DOWNLOAD_FAILED", {
				errorMessage: toError(error).message,
			});
		} finally {
			setIsDownloading(false);
		}
	}, [backupAsync, t]);

	return { downloadBackupAsync, isDownloading };
};
