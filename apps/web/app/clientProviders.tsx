"use client";

import { SessionExpiredModal } from "@tally/ui/auth/sessionExpiredModal";
import { useDatabaseStatusStore } from "@tally/utilities/state/databaseStatus";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Duration } from "luxon";
import { StyleProvider } from "./styles/styleProvider";

type Props = React.PropsWithChildren<{
	className?: string;
}>;

const maxQueryRetries = 3;

export const shouldRetryQuery = (failureCount: number): boolean =>
	!useDatabaseStatusStore.getState().isUnavailable &&
	failureCount < maxQueryRetries;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: shouldRetryQuery,
			staleTime: Duration.fromObject({ minutes: 5 }).toMillis(),
		},
	},
});

export const ClientProviders: React.FC<Props> = ({ children }) => (
	<StyleProvider className="m-0 flex flex-1 flex-col p-0">
		<QueryClientProvider client={queryClient}>
			{children}
			<SessionExpiredModal />
		</QueryClientProvider>
	</StyleProvider>
);
