"use client";

import { Button, Tooltip } from "@heroui/react";
import { IconHelp } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Props {
	linkPath: string;
	subject: string;
}

export const HelpLink: React.FC<Props> = ({ linkPath, subject }) => {
	const router = useRouter();
	const t = useTranslations();

	return (
		<Tooltip content={t("help.link", { subject })}>
			<Button
				isIconOnly={true}
				onPress={() => router.push(linkPath)}
				size="sm"
				variant="light"
			>
				<IconHelp />
			</Button>
		</Tooltip>
	);
};
