import { keysOf } from "@ekumlin/typescript-toolkit/collections";
import { Button, ButtonGroup } from "@heroui/react";
import { type Icon, IconCoins, IconReceipt } from "@tabler/icons-react";
import {
  type TransactionDirection,
  TransactionDirections,
} from "@tally/data-models/contracts/transactionDirection";
import { useTranslations } from "next-intl";

const transactionDirectionIcons: Record<TransactionDirection, Icon> = {
  credit: IconCoins,
  debit: IconReceipt,
};

interface Props {
  direction: TransactionDirection;
  onChange: (direction: TransactionDirection) => void;
}

export const TransactionEditDirectionButtons: React.FC<Props> = ({
  direction,
  onChange,
}) => {
  const t = useTranslations("transactions.types");

  const orderedKeys = keysOf(TransactionDirections).reverse();

  return (
    <ButtonGroup className="flex w-full">
      {orderedKeys.map((d) => {
        const DirectionIcon = transactionDirectionIcons[d];

        return (
          <Button
            className="flex-1"
            color={direction === d ? "primary" : undefined}
            key={d}
            onPress={() => onChange(d)}
            startContent={<DirectionIcon />}
            variant={direction === d ? "solid" : "flat"}
          >
            {t(d)}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};
