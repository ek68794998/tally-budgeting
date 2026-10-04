import { ContentType, Post } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import { type PostDatabaseDropRequest } from "@tally/data-models/contracts/api/postDatabaseDrop";
import { apiResponseSchema } from "@tally/data-models/contracts/api/types";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useMemo } from "react";

/** Throws with the server's stderr (if any) so callers can show it. */
const assertSucceededAsync = async (response: Response): Promise<void> => {
	const parsed = apiResponseSchema.safeParse(
		await response.json().catch(() => ({})),
	);
	const error = parsed.data?.error;

	if (!response.ok || !parsed.success || !parsed.data.success) {
		throw new Error(
			error?.params?.stderr ?? error?.code ?? "Request failed",
		);
	}
};

const fallbackBackupFileName = "tally-backup.dump";

const getDownloadFileName = (response: Response): string =>
	/filename="([^"]+)"/.exec(
		response.headers.get("Content-Disposition") ?? "",
	)?.[1] ?? fallbackBackupFileName;

export const useDatabaseActions = () =>
	useMemo(
		() => ({
			/** Fetches rather than navigates, so a failure can be shown instead of a page of JSON. */
			backupAsync: async () => {
				const response = await apiFetch(
					buildApiRoute(api.database.backup),
				);

				if (!response.ok) {
					await assertSucceededAsync(response);
				}

				const url = URL.createObjectURL(await response.blob());
				const link = document.createElement("a");
				link.href = url;
				link.download = getDownloadFileName(response);
				link.click();
				URL.revokeObjectURL(url);
			},
			dropAsync: async () => {
				const body: PostDatabaseDropRequest = { confirm: "delete" };
				const response = await apiFetch(
					buildApiRoute(api.database.drop),
					{
						body: JSON.stringify(body),
						headers: { [ContentType]: ApplicationJson },
						method: Post,
					},
				);

				await assertSucceededAsync(response);
			},
			restoreAsync: async (file: File) => {
				const formData = new FormData();
				formData.set("confirm", "restore");
				formData.set("file", file);

				const response = await apiFetch(
					buildApiRoute(api.database.restore),
					{ body: formData, method: Post },
				);

				await assertSucceededAsync(response);
			},
		}),
		[],
	);
