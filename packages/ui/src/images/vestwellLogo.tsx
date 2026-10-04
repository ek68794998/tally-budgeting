import { type SVGProps } from "react";
import { getScaledLogoSize } from "./helpers";
import { type LogoImageProps } from "./types";

type Props = LogoImageProps & SVGProps<SVGSVGElement>;

const viewBoxOffsetX = 9;
const viewBoxOffsetY = 9;
const originalHeightPx = 18;
const originalWidthPx = 18;

export const VestwellLogoSvg: React.FC<Props> = (props) => {
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
      <title>{"Vestwell Logo"}</title>
      <path
        d="M25.6797 8.80078c.1767 0 .3203.14359.3203.32031V20.6377c-.0174 1.9922-1.1314 3.8144-2.8994 4.7383l-4.9522 2.5879c-.0928.0485-.204.0485-.2968 0l-4.9522-2.5879c-1.7681-.9238-2.882-2.7461-2.8994-4.7383V9.12109c0-.17672.1436-.32031.3203-.32031h15.3594ZM12.9375 13.1758c-.1329 0-.2289.1271-.1924.2549l1.8516 6.456c.4361 1.5206 1.8262 2.5683 3.4082 2.5684 1.5821 0 2.9731-1.0476 3.4092-2.5684l1.8515-6.456c.0364-.1277-.0596-.2548-.1924-.2549h-1.9609c-.3331 0-.626.2208-.7178.541l-2.3281 8.1172c-.0177.0618-.1053.0618-.123 0l-2.3272-8.1172c-.0918-.3201-.3848-.5409-.7178-.541h-1.9609Z"
        fill="#fff"
        xmlns="http://www.w3.org/2000/svg"
      />
    </svg>
  );
};
