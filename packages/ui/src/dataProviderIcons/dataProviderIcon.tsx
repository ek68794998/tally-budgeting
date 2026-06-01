import { unreachable } from "@ekumlin/typescript-toolkit/values";
import { type AccountProviderType } from "@tally/data-models/contracts/accountProviderType";
import { AppleIcon } from "./appleIcon";
import { ChaseIcon } from "./chaseIcon";
import { FidelityIcon } from "./fidelityIcon";
import { FirstTechIcon } from "./firstTechIcon";
import { GuidelineIcon } from "./guidelineIcon";
import { getDataProviderPaddingRatio, getDataProviderSizePx } from "./helpers";
import { NoDataProviderIcon } from "./noDataProviderIcon";
import { RipplingIcon } from "./ripplingIcon";
import { RobinhoodIcon } from "./robinhoodIcon";
import { type DataProviderIconSize } from "./types";
import { VestwellIcon } from "./vestwellIcon";

interface Props {
	provider: AccountProviderType | null;
	size?: DataProviderIconSize;
}

export const DataProviderIcon: React.FC<Props> = ({
	provider,
	size = "md",
}) => {
	const paddingRatio = getDataProviderPaddingRatio();
	const sizePx = getDataProviderSizePx(size);

	const containerSizePx = sizePx * paddingRatio;

	if (!provider) {
		return (
			<NoDataProviderIcon
				containerSizePx={containerSizePx}
				sizePx={sizePx}
			/>
		);
	}

	switch (provider) {
		case "apple":
			return (
				<AppleIcon containerSizePx={containerSizePx} sizePx={sizePx} />
			);
		case "chase":
			return (
				<ChaseIcon containerSizePx={containerSizePx} sizePx={sizePx} />
			);
		case "fidelity":
			return (
				<FidelityIcon
					containerSizePx={containerSizePx}
					sizePx={sizePx}
				/>
			);
		case "firstTechFederal":
			return (
				<FirstTechIcon
					containerSizePx={containerSizePx}
					sizePx={sizePx}
				/>
			);
		case "guideline":
			return (
				<GuidelineIcon
					containerSizePx={containerSizePx}
					sizePx={sizePx}
				/>
			);
		case "rippling":
			return (
				<RipplingIcon
					containerSizePx={containerSizePx}
					sizePx={sizePx}
				/>
			);
		case "robinhood":
			return (
				<RobinhoodIcon
					containerSizePx={containerSizePx}
					sizePx={sizePx}
				/>
			);
		case "vestwell":
			return (
				<VestwellIcon
					containerSizePx={containerSizePx}
					sizePx={sizePx}
				/>
			);
		default:
			return unreachable(provider);
	}
};
