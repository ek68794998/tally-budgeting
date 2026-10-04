import { type SVGProps } from "react";
import { getScaledLogoSize } from "./helpers";
import { type LogoImageProps } from "./types";

type Props = LogoImageProps & SVGProps<SVGSVGElement>;

const viewBoxOffsetX = 0;
const viewBoxOffsetY = 0;
const originalHeightPx = 36;
const originalWidthPx = 46;

export const RipplingLogoSvg: React.FC<Props> = (props) => {
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
      <title>{"Rippling Logo"}</title>
      <path
        d="M6.1,14.4c0-3.3-1.7-6-4.8-8.3h7.3c1.3,1,2.3,2.2,3,3.7.7,1.4,1.1,3,1.1,4.7,0,1.6-.4,3.2-1.1,4.7-.7,1.4-1.8,2.7-3,3.7,2.4,1,3.7,3.4,3.7,6.8v6.6h-6.6v-6.6c0-3.3-1.6-5.6-4.4-6.8,3.1-2.3,4.8-5,4.8-8.3h0ZM20.3,14.4c0-3.3-1.7-6-4.8-8.3h7.3c1.3,1,2.3,2.2,3,3.7.7,1.4,1.1,3,1.1,4.7,0,1.6-.4,3.2-1.1,4.7-.7,1.4-1.8,2.7-3,3.7,2.4,1,3.7,3.4,3.7,6.8v6.6h-6.6v-6.6c0-3.3-1.6-5.6-4.4-6.8,3.1-2.3,4.8-5,4.8-8.3h0ZM34.6,14.4c0-3.3-1.7-6-4.8-8.3h7.3c1.3,1,2.3,2.2,3,3.7.7,1.4,1.1,3,1.1,4.7,0,1.6-.4,3.2-1.1,4.7-.7,1.4-1.8,2.7-3,3.7,2.4,1,3.7,3.4,3.7,6.8v6.6h-6.6v-6.6c0-3.3-1.6-5.6-4.4-6.8,3.1-2.3,4.8-5,4.8-8.3h0Z"
        fill="#fff"
      />
    </svg>
  );
};
