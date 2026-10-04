import { DatabaseUnavailableBanner } from "@tally/ui/common/databaseUnavailableBanner";
import { Sidebar } from "@tally/ui/sidebar/sidebar";

const RootTemplate: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex flex-1 items-stretch">
    <Sidebar className="fixed inset-y-0 min-w-3xs p-4 shadow-lg" />
    <div className="ml-64 flex-1 p-4">
      <DatabaseUnavailableBanner />
      {children}
    </div>
  </div>
);

export default RootTemplate;
