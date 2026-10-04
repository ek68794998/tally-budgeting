import { RetirementChart } from "./retirementChart";
import { RetirementInputs } from "./retirementInputs";
import { RetirementProvider } from "./retirementProvider";
import { RetirementSummaryCards } from "./retirementSummaryCards";
import { RetirementTable } from "./retirementTable";

export const RetirementCalculator: React.FC = () => (
  <RetirementProvider>
    <div className="grid grid-cols-2 justify-stretch gap-4">
      <RetirementInputs />
      <RetirementChart />
      <RetirementSummaryCards className="col-span-2" />
      <RetirementTable className="col-span-2" />
    </div>
  </RetirementProvider>
);
