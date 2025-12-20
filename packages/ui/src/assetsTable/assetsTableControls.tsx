import { Button, Input } from "@heroui/react";
import { IconSearch, IconUpload } from "@tabler/icons-react";
import { useDebounceEffect } from "ahooks";
import { Duration } from "luxon";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
	onFilterChange: (value: string) => void;
	onNewAsset: () => void;
}

const debounceDuration = Duration.fromObject({
	milliseconds: 500,
});

export const AssetsTableControls: React.FC<Props> = ({
	onFilterChange,
	onNewAsset,
}) => {
	const t = useTranslations("assets");

	const [filterValue, setFilterValue] = useState("");

	useDebounceEffect(
		() => {
			onFilterChange(filterValue);
		},
		[filterValue, onFilterChange],
		{ wait: debounceDuration.toMillis() },
	);

	return (
		<div className="flex justify-between gap-4">
			<Input
				isClearable={true}
				onClear={() => setFilterValue("")}
				onValueChange={setFilterValue}
				placeholder={t("listControls.filterPlaceholder")}
				startContent={<IconSearch />}
				value={filterValue}
			/>
			<Button
				className="flex-none"
				onPress={onNewAsset}
				startContent={<IconUpload size={16} />}
			>
				{t("listControls.addOne")}
			</Button>
		</div>
	);
};
