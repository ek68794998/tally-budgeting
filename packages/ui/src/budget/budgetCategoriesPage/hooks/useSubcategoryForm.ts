import { invariant } from "@ekumlin/typescript-toolkit/values";
import { type BudgetType } from "@tally/data-models/contracts/budgetType";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useEffect, useState } from "react";

const preTaxSavingsThresholdPercent = 99;

export const useSubcategoryForm = (
  subcategory: Subcategory | null,
  isModalOpen: boolean,
) => {
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [budgetFrequency, setBudgetFrequency] = useState(1);
  const [budgetType, setBudgetType] = useState<BudgetType>("expense");
  const [categoryId, setCategoryId] = useState(DefaultCategoryId);
  const [description, setDescription] = useState("");
  const [isPreTaxSavings, setIsPreTaxSavings] = useState(false);
  const [label, setLabel] = useState("");
  const [pctNeeds, setPctNeeds] = useState(0);
  const [pctWants, setPctWants] = useState(0);

  useEffect(() => {
    if (!isModalOpen || !subcategory) {
      return;
    }

    setBudgetAmount(Dollars.fromCents(subcategory.budget.amountCents));
    setBudgetFrequency(subcategory.budget.frequency);
    setBudgetType(subcategory.budget.type);
    setCategoryId(subcategory.categoryId);
    setDescription(subcategory.description);
    setIsPreTaxSavings(
      subcategory.budget.type === "income" &&
        subcategory.percentSavings > preTaxSavingsThresholdPercent,
    );
    setLabel(subcategory.label);
    setPctNeeds(subcategory.percentNeeds);
    setPctWants(100 - subcategory.percentNeeds - subcategory.percentSavings);
  }, [isModalOpen, subcategory]);

  const updatePctNeeds = (newNeeds: number) => {
    if (newNeeds + pctWants > 100) {
      setPctWants(100 - newNeeds);
    }

    setPctNeeds(newNeeds);
  };

  const updatePctWants = (newWants: number) => {
    if (newWants + pctNeeds > 100) {
      setPctNeeds(100 - newWants);
    }

    setPctWants(newWants);
  };

  const pctSavings = 100 - pctNeeds - pctWants;

  let percentSavings = pctSavings;
  let percentNeeds = pctNeeds;

  if (budgetType === "income") {
    percentNeeds = 0;
    percentSavings = isPreTaxSavings ? 100 : 0;
  }

  return {
    budgetAmount,
    budgetFrequency,
    budgetType,
    buildSubcategory: (): Subcategory => {
      invariant(subcategory, "Subcategory must be defined.");

      return {
        ...subcategory,
        budget: {
          amountCents: Dollars.toCents(budgetAmount),
          frequency: budgetFrequency,
          type: budgetType,
        },
        categoryId,
        description,
        label,
        percentNeeds,
        percentSavings,
      };
    },
    canSave: !!label,
    categoryId,
    description,
    isPreTaxSavings,
    label,
    pctNeeds,
    pctSavings,
    pctWants,
    setBudgetAmount,
    setBudgetFrequency,
    setBudgetType,
    setCategoryId,
    setDescription,
    setIsPreTaxSavings,
    setLabel,
    updatePctNeeds,
    updatePctWants,
  };
};
