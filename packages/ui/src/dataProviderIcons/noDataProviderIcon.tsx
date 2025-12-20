import { IconCash } from "@tabler/icons-react";

interface Props {
	containerSizePx: number;
	sizePx: number;
}

export const NoDataProviderIcon: React.FC<Props> = ({
	containerSizePx,
	sizePx,
}) => (
	<div
		className="flex items-center justify-center rounded-sm bg-stone-500 text-white/70"
		style={{
			height: containerSizePx,
			width: containerSizePx,
		}}
	>
		<IconCash size={sizePx} />
	</div>
);
