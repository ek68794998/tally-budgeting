import { Button } from "@heroui/react";
import { type Icon, IconMarqueeOff } from "@tabler/icons-react";

interface Action {
  label: string;
  onClick: () => void;
}

interface Props {
  actions?: Action[];
  IconComponent?: Icon;
  primaryText: string;
  secondaryText?: string;
}

export const ContentUnavailableView: React.FC<Props> = ({
  actions,
  IconComponent = IconMarqueeOff,
  primaryText,
  secondaryText,
}) => (
  <div className="flex flex-col items-center gap-4">
    <IconComponent size={64} />
    <div>{primaryText}</div>
    {secondaryText ? <p>{secondaryText}</p> : null}
    {actions?.length ? (
      <div>
        {actions.map((action) => (
          <Button key={action.label} onPress={action.onClick}>
            {action.label}
          </Button>
        ))}
      </div>
    ) : null}
  </div>
);
