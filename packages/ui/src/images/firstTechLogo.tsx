import { type SVGProps } from "react";
import { getScaledLogoSize } from "./helpers";
import { type LogoImageProps } from "./types";

type Props = LogoImageProps & SVGProps<SVGSVGElement>;

const viewBoxOffsetX = -587.2;
const viewBoxOffsetY = 429.8;
const originalHeightPx = 200;
const originalWidthPx = 222.1;

export const FirstTechLogoSvg: React.FC<Props> = (props) => {
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
      <title>{"First Tech Federal Logo"}</title>
      <path
        d="M-455 441.5v29.6l-61.1 59.2h12.7c6.5 0 12 .7 15.9 5.5 5.2 6.5 4.9 13.7 4.9 20.5v95.6l-86.8-85.5s-7.8-8.5-7.8-17.9 7.5-17.6 7.5-17.6l90.7-89.4s10.1-11.7 16.3-11.7c8.1.3 7.7 11.7 7.7 11.7m-.6 169.8s-.3 13 5.5 13c1.6 0 4.9-2.6 4.9-2.6l62.1-61.8s5.9-4.9 5.9-12c0-7.2-5.9-12-5.9-12l-62.1-61.8s-2.3-2.3-4.6-2.3c-6.2 0-5.5 13-5.5 13v126.5h-.3z"
        fill={props.color}
      />
    </svg>
  );
};
