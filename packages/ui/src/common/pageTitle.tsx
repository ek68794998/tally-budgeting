"use client";

import { Link } from "@heroui/react";
import { IconChevronsRight } from "@tabler/icons-react";
import {
	type Subpage,
	type SubpageMap,
} from "@tally/utilities/routing/pageData";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
	knownSubpages?: SubpageMap;
	title: string;
}

export const PageTitle: React.FC<Props> = ({
	knownSubpages,
	title: baseTitle,
}) => {
	const pathName = usePathname();

	const [base, ...pathParts] = pathName.split("/").filter(Boolean);

	const subpages: Subpage[] = [{ href: `/${base ?? ""}`, title: baseTitle }];

	for (const pathPart of pathParts) {
		const subpage = knownSubpages?.[pathPart];

		if (!subpage) {
			continue;
		}

		subpages.push(subpage);
	}

	const breadcrumbClassNames = "text-4xl";

	return (
		<h1 className="flex items-center gap-2">
			{subpages.map(({ href, title }, i) =>
				i === subpages.length - 1 ? (
					<div
						className={twMerge(breadcrumbClassNames, "font-black")}
						key={href}
					>
						{title}
					</div>
				) : (
					<Fragment key={href}>
						<Link
							as={NextLink}
							className={twMerge(
								breadcrumbClassNames,
								"brightness-75",
							)}
							color="primary"
							href={href}
						>
							{title}
						</Link>
						<IconChevronsRight />
					</Fragment>
				),
			)}
		</h1>
	);
};
