import { SettingsMasterDetail } from "@tally/ui/settingsPage/settingsMasterDetail";
import { Suspense } from "react";

const SettingsPage: React.FC = () => (
	<div className="flex flex-col gap-4">
		<Suspense>
			<SettingsMasterDetail />
		</Suspense>
	</div>
);

export default SettingsPage;
