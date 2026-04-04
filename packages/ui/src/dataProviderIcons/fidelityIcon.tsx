import { FidelityLogoSvg } from "../images/fidelityLogo";
import { type DataProviderIconProps } from "./types";

type Props = DataProviderIconProps;

export const FidelityIcon: React.FC<Props> = ({ containerSizePx, sizePx }) => (
	<div
		className="flex items-center justify-center rounded-sm bg-[#368727]"
		style={{
			height: containerSizePx,
			width: containerSizePx,
		}}
	>
		<FidelityLogoSvg
			color="#fff"
			containerHeight={sizePx}
			containerWidth={sizePx}
		/>
	</div>
);
