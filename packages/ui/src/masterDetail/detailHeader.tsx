import { Button } from "@heroui/react";
import { IconChevronLeft } from "@tabler/icons-react";

interface Props {
  actions?: React.ReactNode;
  masterTitle: string;
  onBack: () => void;
  title?: string;
}

export const DetailHeader: React.FC<Props> = ({
  actions,
  masterTitle,
  onBack,
  title,
}) => (
  <div className="flex items-center gap-4">
    <div className="@xl:hidden">
      <Button
        aria-label={masterTitle}
        isIconOnly={true}
        onPress={onBack}
        variant="flat"
      >
        <IconChevronLeft />
      </Button>
    </div>
    {title && (
      <div className="@xl:block">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
    )}
    <span className="flex-1" />
    {actions && <div className="@xl:block">{actions}</div>}
  </div>
);
