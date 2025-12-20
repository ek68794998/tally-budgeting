"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Duration } from "luxon";
import { StyleProvider } from "./styles/styleProvider";

type Props = React.PropsWithChildren<{
	className?: string;
}>;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			staleTime: Duration.fromObject({ minutes: 5 }).toMillis(),
		},
	},
});

export const ClientProviders: React.FC<Props> = ({ children }) => (
	<StyleProvider className="m-0 flex flex-1 flex-col p-0">
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	</StyleProvider>
);
