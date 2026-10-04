import { unreachable } from "@ekumlin/typescript-toolkit/values";
import { Accordion, AccordionItem } from "@heroui/react";
import {
  type Icon,
  IconAlertTriangle,
  IconInfoCircle,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  type ActionItem,
  type ActionItems,
} from "@tally/data-models/contracts/api/getBudgetSummary";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { type BudgetDate } from "../types";
import { BudgetActionItemsSection } from "./budgetActionItemsSection";

interface Props {
  data: ActionItems;
  periodEnd: BudgetDate;
}

export const BudgetActionItems: React.FC<Props> = ({ data, periodEnd }) => {
  const t = useTranslations("budget");

  const itemSets: ActionItem[][] = [
    data.overBudget,
    data.aboveAverage,
    data.worsened,
    data.improved,
  ];

  const getDisplayData = (actionItem: ActionItem) => {
    const { type } = actionItem;

    let titleKey: Parameters<typeof t>[0];
    let subtitleKey: Parameters<typeof t>[0];
    let IconComponent: Icon;
    let iconBgClassName: string;
    let iconFgClassName: string;

    switch (type) {
      case "aboveAverage":
        titleKey = "overview.sectionAboveAverageTitle";
        subtitleKey = "overview.sectionAboveAverageSubtitle";
        IconComponent = IconInfoCircle;
        iconBgClassName = "bg-secondary-200";
        iconFgClassName = "text-secondary-700";
        break;
      case "budgetChange":
        const isImprovement =
          actionItem.currentSpent < actionItem.previousSpent;
        titleKey = isImprovement
          ? "overview.sectionImprovedTitle"
          : "overview.sectionWorsenedTitle";
        subtitleKey = isImprovement
          ? "overview.sectionImprovedSubtitle"
          : "overview.sectionWorsenedSubtitle";
        IconComponent = isImprovement ? IconTrendingDown : IconTrendingUp;
        iconBgClassName = "bg-default-400";
        iconFgClassName = "text-default-800";
        break;
      case "overBudget":
        titleKey = "overview.sectionOverBudgetTitle";
        subtitleKey = "overview.sectionOverBudgetSubtitle";
        IconComponent = IconAlertTriangle;
        iconBgClassName = "bg-danger-200";
        iconFgClassName = "text-danger-700";
        break;
      default:
        unreachable(type);
    }

    // biome-ignore assist/source/useSortedKeys: Prefer case-insensitive order (competes with ESLint).
    return {
      iconBgClassName,
      IconComponent,
      iconFgClassName,
      subtitleKey,
      titleKey,
    };
  };

  return (
    <div className="flex gap-4">
      <Accordion selectionMode="multiple">
        {itemSets.map((itemSet) => {
          const firstItem = itemSet[0];

          if (!firstItem) {
            return null;
          }

          const {
            iconBgClassName,
            IconComponent,
            iconFgClassName,
            subtitleKey,
            titleKey,
          } = getDisplayData(firstItem);

          const title = t(titleKey);
          const subtitle = t(subtitleKey, { count: itemSet.length });

          return (
            <AccordionItem
              classNames={{
                content: "flex flex-col gap-4 mb-4",
                heading: "font-sans! font-bold",
                subtitle: "font-light opacity-70",
                titleWrapper: "cursor-pointer",
              }}
              key={`${firstItem.type}-${firstItem.subcategoryId}`}
              startContent={
                <div
                  className={twMerge(
                    iconFgClassName,
                    iconBgClassName,
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                  )}
                >
                  <IconComponent />
                </div>
              }
              subtitle={subtitle}
              title={title}
            >
              <BudgetActionItemsSection data={itemSet} periodEnd={periodEnd} />
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
