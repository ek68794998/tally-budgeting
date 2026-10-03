import { FirstTechLogoSvg } from "../images/firstTechLogo";
import { type DataProviderIconProps } from "./types";

type Props = DataProviderIconProps;

export const FirstTechIcon: React.FC<Props> = ({ containerSizePx, sizePx }) => (
	<div
		className="
			flex items-center justify-center rounded-sm bg-linear-to-br
			from-[#009ddc] to-[#009900]
		"
		style={{
			height: containerSizePx,
			width: containerSizePx,
		}}
	>
		<FirstTechLogoSvg
			color="#fff"
			containerHeight={sizePx}
			containerWidth={sizePx}
		/>
	</div>
);
