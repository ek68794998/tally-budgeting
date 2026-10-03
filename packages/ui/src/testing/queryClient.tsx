import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type PropsWithChildren } from "react";

export const createQueryClientWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			mutations: { retry: false },
			queries: { retry: false },
		},
	});

	const QueryClientWrapper: React.FC<PropsWithChildren> = ({ children }) => (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);

	return { queryClient, wrapper: QueryClientWrapper };
};
