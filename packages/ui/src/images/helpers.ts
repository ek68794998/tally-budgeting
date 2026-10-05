import { scaleToFit } from "@ekumlin/typescript-toolkit/number";

export const getScaledLogoSize = (
  originalWidth: number,
  originalHeight: number,
  containerWidth: number | undefined,
  containerHeight: number | undefined,
): [number, number] | null => {
  if (containerHeight || containerWidth) {
    const { height: scaledHeightPx, width: scaledWidthPx } = scaleToFit(
      {
        height: containerHeight ?? 99999,
        width: containerWidth ?? 99999,
      },
      { height: originalHeight, width: originalWidth },
    );

    return [scaledWidthPx, scaledHeightPx];
  }

  return null;
};
