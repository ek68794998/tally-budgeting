import { AppleLogoSvg } from "../images/appleLogo";

interface Props {
	containerSizePx: number;
	sizePx: number;
}

const getBackgroundGradient = () =>
	`conic-gradient(#eeb778 0deg, #f1e5b7 45deg, #eeca5f 135deg, #a5ad77 180deg, #b590eb 225deg, #d9a0be 270deg, #e7cca9 315deg, #eeb778 360deg)`;

export const AppleIcon: React.FC<Props> = ({ containerSizePx, sizePx }) => (
	<div
		className="flex items-center justify-center rounded-sm"
		style={{
			backgroundImage: getBackgroundGradient(),
			height: containerSizePx,
			width: containerSizePx,
		}}
	>
		<AppleLogoSvg
			color="#fff"
			containerHeight={sizePx}
			containerWidth={sizePx}
		/>
	</div>
);
