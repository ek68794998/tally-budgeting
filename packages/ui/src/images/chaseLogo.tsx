import { type SVGProps } from "react";
import { getScaledLogoSize } from "./helpers";
import { type LogoImageProps } from "./types";

type Props = LogoImageProps & SVGProps<SVGSVGElement>;

const originalHeightPx = 442.569;
const originalWidthPx = 442.569;

export const ChaseLogoSvg: React.FC<Props> = (props) => {
	const { containerHeight, containerWidth, ...svgProps } = props;

	const [scaledWidthPx, scaledHeightPx] =
		getScaledLogoSize(
			originalWidthPx,
			originalHeightPx,
			containerWidth,
			containerHeight,
		) ?? [];

	const svgHeightPx = scaledHeightPx || props.height || originalHeightPx;
	const svgWidthPx = scaledWidthPx || props.width || originalWidthPx;

	return (
		<svg
			height={svgHeightPx}
			viewBox={`0 0 ${originalWidthPx} ${originalHeightPx}`}
			width={svgWidthPx}
			xmlns="http://www.w3.org/2000/svg"
			{...svgProps}
		>
			<title>{"Chase Logo"}</title>
			<path
				d="M158.06 0a14.667 14.667 0 0 0-14.876 14.876V124.59H433.27L301.244 0ZM442.569 158.06a14.667 14.667 0 0 0-14.877-14.876H317.98V433.27l124.588-132.027ZM284.508 442.568a14.667 14.667 0 0 0 14.877-14.876V317.98H9.298l132.026 124.589ZM0 284.508a14.667 14.667 0 0 0 14.876 14.877H124.59V11.157L0 143.184Z"
				fill={props.color}
			/>
		</svg>
	);
};
