"use client";

import { Card, CardBody } from "@heroui/react";
import { twMerge } from "tailwind-merge";

interface DataPoint {
  title: string;
  value: NonNullable<React.ReactNode>;
}

interface Props {
  centered?: boolean;
  data: DataPoint | DataPoint[];
  size?: "md" | "lg" | "xl";
}

interface SizePreset {
  dataGap: string;
  padding: string;
  titleFontSize: string;
  titleGap: string;
  valueFontSize: string;
}

const sizePresets: Record<Props["size"] & string, SizePreset> = {
  lg: {
    dataGap: "gap-8",
    padding: "p-7",
    titleFontSize: "text-2xl",
    titleGap: "gap-1",
    valueFontSize: "text-5xl",
  },
  md: {
    dataGap: "gap-4",
    padding: "p-6",
    titleFontSize: "text-xl",
    titleGap: "gap-1",
    valueFontSize: "text-4xl",
  },
  xl: {
    dataGap: "gap-12",
    padding: "p-8",
    titleFontSize: "text-2xl",
    titleGap: "gap-2",
    valueFontSize: "text-6xl",
  },
};

export const DataCard: React.FC<Props> = ({ centered, data, size = "md" }) => {
  const dataPoints = Array.isArray(data) ? data : [data];

  const { dataGap, padding, titleFontSize, titleGap, valueFontSize } =
    sizePresets[size];

  return (
    <Card isBlurred={true}>
      <CardBody
        className={twMerge(
          "flex flex-col items-stretch justify-center",
          dataGap,
          padding,
        )}
      >
        {dataPoints.map((point) => (
          <div
            className={twMerge(
              "flex flex-col items-stretch",
              centered && "items-center",
              titleGap,
            )}
            key={point.title}
          >
            <h3 className={twMerge("opacity-75", titleFontSize)}>
              {point.title}
            </h3>
            <div className={twMerge("font-sans font-black", valueFontSize)}>
              {point.value}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
};
