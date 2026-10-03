import { Unauthorized } from "@ekumlin/typescript-toolkit/http";
import { useSessionStore } from "../state/session";

export const apiFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> =>
	fetch(input, init).then((response) => {
		if (response.status === Unauthorized) {
			useSessionStore.getState().markExpired();
		}

		return response;
	});
