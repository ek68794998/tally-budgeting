import { Switch } from "@heroui/react";
import { type AccountProviderType } from "@tally/data-models/contracts/accountProviderType";
import { AccountProviders } from "@tally/data-models/data/accountProviders";
import { DataProviderIcon } from "../../dataProviderIcons/dataProviderIcon";

interface Props {
  hiddenProviders: AccountProviderType[];
  onChange: (hiddenProviders: AccountProviderType[]) => void;
}

export const SettingProviderList: React.FC<Props> = ({
  hiddenProviders,
  onChange,
}) => (
  <ul className="flex flex-col">
    {Object.values(AccountProviders).map(({ id, name }) => {
      const isShown = !hiddenProviders.includes(id);

      return (
        <li
          className="
            border-default-200 flex items-center justify-between gap-4 border-b
            py-3
            last:border-b-0
          "
          key={id}
        >
          <div className="flex items-center gap-2">
            <DataProviderIcon provider={id} size="md" />
            <span>{name}</span>
          </div>
          <Switch
            aria-label={name}
            isSelected={isShown}
            onValueChange={(shouldShow) =>
              onChange(
                Object.values(AccountProviders)
                  .map((provider) => provider.id)
                  .filter((providerId) =>
                    providerId === id
                      ? !shouldShow
                      : hiddenProviders.includes(providerId),
                  ),
              )
            }
          />
        </li>
      );
    })}
  </ul>
);
