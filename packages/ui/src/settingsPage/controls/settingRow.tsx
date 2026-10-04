import { type SettingScope } from "@tally/data-models/settings/settingDefinitions";
import { SettingScopeChip } from "./settingScopeChip";

interface Props {
  children: React.ReactNode;
  description?: string;
  label: string;
  scope: SettingScope;
}

export const SettingRow: React.FC<Props> = ({
  children,
  description,
  label,
  scope,
}) => (
  <div
    className="
      border-default-200 flex items-center justify-between gap-4 border-b py-4
      last:border-b-0
    "
  >
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{label}</span>
        <SettingScopeChip scope={scope} />
      </div>
      {description && <span className="text-sm opacity-60">{description}</span>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);
