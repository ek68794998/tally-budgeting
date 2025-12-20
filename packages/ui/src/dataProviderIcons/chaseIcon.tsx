import { ChaseLogoSvg } from "../images/chaseLogo";

interface Props {
	containerSizePx: number;
	sizePx: number;
}

export const ChaseIcon: React.FC<Props> = ({ containerSizePx, sizePx }) => (
	<div
		className="flex items-center justify-center rounded-sm bg-[#126bc5]"
		style={{
			height: containerSizePx,
			width: containerSizePx,
		}}
	>
		<ChaseLogoSvg
			color="#fff"
			containerHeight={sizePx}
			containerWidth={sizePx}
		/>
	</div>
);
