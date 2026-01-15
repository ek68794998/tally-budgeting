import { invariant } from "@ekumlin/typescript-toolkit/values";
import { type AccountProvider } from "../contracts/accountProvider";
import { type AccountProviderType } from "../contracts/accountProviderType";

export const AccountProviders = {
	apple: { id: "apple", name: "Apple Wallet" },
	chase: { id: "chase", name: "Chase Bank" },
	fidelity: { id: "fidelity", name: "Fidelity Investments" },
	firstTechFederal: {
		id: "firstTechFederal",
		name: "First Tech Federal Credit Union",
	},
	guideline: {
		id: "guideline",
		name: "Guideline",
	},
	robinhood: {
		id: "robinhood",
		name: "Robinhood",
	},
} as const satisfies Record<AccountProviderType, AccountProvider>;

invariant(
	Object.entries(AccountProviders).every(([key, value]) => key === value.id),
	"All account provider keys must match their corresponding IDs.",
);
