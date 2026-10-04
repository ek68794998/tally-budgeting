import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";
import { type AccountProviderType } from "@tally/data-models/contracts/accountProviderType";

/** Items without a provider always count as visible. */
export const partitionByProviderVisibility = <T>(
	items: T[],
	getProvider: (item: T) => AccountProviderType | null,
	hiddenProviders: AccountProviderType[],
): { hidden: T[]; visible: T[] } => {
	const hidden: T[] = [];
	const visible: T[] = [];

	for (const item of items) {
		const provider = getProvider(item);

		if (
			!isNullOrUndefined(provider) &&
			hiddenProviders.includes(provider)
		) {
			hidden.push(item);
		} else {
			visible.push(item);
		}
	}

	return { hidden, visible };
};
