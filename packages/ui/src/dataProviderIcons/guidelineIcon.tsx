import { GuidelineLogoSvg } from "../images/guidelineLogo";

interface Props {
	containerSizePx: number;
	sizePx: number;
}

export const GuidelineIcon: React.FC<Props> = ({ containerSizePx, sizePx }) => (
	<div
		className="flex items-center justify-center rounded-sm bg-[#191817]"
		style={{
			height: containerSizePx,
			width: containerSizePx,
		}}
	>
		<GuidelineLogoSvg
			color="#fff"
			containerHeight={sizePx}
			containerWidth={sizePx}
		/>
	</div>
);
