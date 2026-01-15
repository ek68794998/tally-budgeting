import { useEffect, useState } from "react";

interface UseLatestDataProps<T> {
	initial: T;
	isLoading: boolean;
	latest: T;
}

export const useLatestData = <T>({
	initial,
	isLoading,
	latest,
}: UseLatestDataProps<T>) => {
	const [data, setData] = useState(initial);

	useEffect(() => {
		if (isLoading) {
			return;
		}

		const hasNewData =
			latest && (!Array.isArray(latest) || latest.length > 0);

		if (!hasNewData) {
			return;
		}

		setData(latest);
	}, [isLoading, latest]);

	return data;
};
