import { VestwellLogoSvg } from "../images/vestwellLogo";
import { type DataProviderIconProps } from "./types";

type Props = DataProviderIconProps;

export const VestwellIcon: React.FC<Props> = ({ containerSizePx, sizePx }) => (
	<div
		className="flex items-center justify-center rounded-sm bg-[#004dff]"
		style={{
			height: containerSizePx,
			width: containerSizePx,
		}}
	>
		<VestwellLogoSvg containerHeight={sizePx} containerWidth={sizePx} />
	</div>
);
