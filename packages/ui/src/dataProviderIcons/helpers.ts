import { type DataProviderIconSize } from "./types";

export const getDataProviderPaddingRatio = (): number => 1.25;

export const getDataProviderSizePx = (size: DataProviderIconSize): number => {
	switch (size) {
		case "sm":
			return 16;
		case "lg":
			return 32;
		default:
			return 24;
	}
};
