import {
	ServiceUnavailable,
	Unauthorized,
} from "@ekumlin/typescript-toolkit/http";
import { apiResponseSchema } from "@tally/data-models/contracts/api/types";
import { useDatabaseStatusStore } from "../state/databaseStatus";
import { useSessionStore } from "../state/session";

export const isDatabaseUnavailableResponseAsync = async (
	response: Response,
): Promise<boolean> => {
	if (response.status !== ServiceUnavailable) {
		return false;
	}

	try {
		const body: unknown = await response.clone().json();
		const parsed = apiResponseSchema.safeParse(body);

		return parsed.data?.error?.code === "databaseUnavailable";
	} catch {
		return false;
	}
};

const trackResponseStatusAsync = async (
	response: Response,
): Promise<Response> => {
	if (response.status === Unauthorized) {
		useSessionStore.getState().markExpired();
	} else if (await isDatabaseUnavailableResponseAsync(response)) {
		useDatabaseStatusStore.getState().markUnavailable();
	}

	return response;
};

export const apiFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> => fetch(input, init).then(trackResponseStatusAsync);
