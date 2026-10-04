import { type SVGProps } from "react";
import { getScaledLogoSize } from "./helpers";
import { type LogoImageProps } from "./types";

type Props = LogoImageProps & SVGProps<SVGSVGElement>;

const viewBoxOffsetX = 0;
const viewBoxOffsetY = 0;
const originalHeightPx = 64.5;
const originalWidthPx = 34.3;

export const GuidelineLogoSvg: React.FC<Props> = (props) => {
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
      viewBox={`${viewBoxOffsetX} ${viewBoxOffsetY} ${originalWidthPx} ${originalHeightPx}`}
      width={svgWidthPx}
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <title>{"Guideline Logo"}</title>
      <g>
        <path
          d="M21.8,9.9c-2.6-2-6.2-2-8.8,0c-1.8,1.5-2.9,3.8-2.9,7.6c0,3.8,1,6.1,2.9,7.6c2.6,2,6.2,2,8.8,0
             c1.6-1.8,2.6-3.8,2.9-7.6C24.7,13.7,23.6,11.4,21.8,9.9z"
          fill="none"
        />
        <path
          d="M26,0.8l-0.5,4.8c-1-2.8-4.1-5.6-9.9-5.6c-3.4,0-5.7,0.8-8.1,2C2.6,5.1,0,10.6,0,17.5c0,7.3,2.9,12.7,7.5,15.5
             c2.3,1.3,4.9,2,7.8,2c5.5,0,7.8-2.5,8.6-4.6v5.1c0,3.6-2.9,6.3-6.8,6.6c-3.9,0.3-6.8-1.3-7.3-4.6l-7.8,3.8
             c1.8,5.3,7.3,8.4,15.3,8.4c9.9,0,16.9-5.3,16.9-14.7V0.8H26z M21.8,25.1c-2.6,2-6.2,2-8.8,0c-1.8-1.5-2.9-3.8-2.9-7.6
             c0-3.8,1-6.1,2.9-7.6c2.6-2,6.2-2,8.8,0c1.8,1.5,2.9,3.8,2.9,7.6C24.4,21.3,23.4,23.3,21.8,25.1z"
          fill="#fff"
        />
        <polygon
          fill="#5532fa"
          points="27.7,57.9 0,57.9 0,64.5 34.3,64.5 34.3,53 27.7,53"
        />
      </g>
    </svg>
  );
};
