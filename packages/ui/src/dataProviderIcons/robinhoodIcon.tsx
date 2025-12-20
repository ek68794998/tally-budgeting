import { RobinhoodLogoSvg } from "../images/robinhoodLogo";

interface Props {
	containerSizePx: number;
	sizePx: number;
}

export const RobinhoodIcon: React.FC<Props> = ({ containerSizePx, sizePx }) => (
	<div
		className="flex items-center justify-center rounded-sm bg-[#d6fe51]"
		style={{
			height: containerSizePx,
			width: containerSizePx,
		}}
	>
		<RobinhoodLogoSvg containerHeight={sizePx} containerWidth={sizePx} />
	</div>
);
