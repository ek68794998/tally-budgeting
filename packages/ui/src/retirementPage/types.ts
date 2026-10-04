import z from "zod";

export const retirementCalculatorInputsSchema = z.object({
  annualInflationRatePercent: z.number().min(0).max(100),
  annualInvestmentReturnPercent: z.number().min(0).max(100),
  annualRaise: z.number().min(0).max(100),
  contributionPercent: z.number().min(0).max(100),
  currentAge: z.number().min(0),
  currentPretaxIncome: z.number().min(0),
  currentRetirementInvestments: z.number().min(0),
  lifeExpectancy: z.number().min(0),
  postRetirementIncomeNeeded: z.number().min(0),
  retirementAge: z.number().min(0),
});

export type RetirementCalculatorInputs = z.infer<
  typeof retirementCalculatorInputsSchema
>;

export interface RetirementDataByYear {
  addedToRetirement: number;
  age: number;
  assumedIncome: number;
  compoundInflation: number;
  distributedFromRetirement: number;
  retirementAmount: number;
  retirementAmountToday: number;
  year: number;
}

export interface RetirementData {
  dataByYear: RetirementDataByYear[];
}
