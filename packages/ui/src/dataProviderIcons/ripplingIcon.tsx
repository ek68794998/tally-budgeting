import { RipplingLogoSvg } from "../images/ripplingLogo";
import { type DataProviderIconProps } from "./types";

type Props = DataProviderIconProps;

export const RipplingIcon: React.FC<Props> = ({ containerSizePx, sizePx }) => (
  <div
    className="flex items-center justify-center rounded-sm bg-[#6f135a]"
    style={{
      height: containerSizePx,
      width: containerSizePx,
    }}
  >
    <RipplingLogoSvg containerHeight={sizePx} containerWidth={sizePx} />
  </div>
);
