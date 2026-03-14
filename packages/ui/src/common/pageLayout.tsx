import { PageTitle } from "./pageTitle";

type Props = React.PropsWithChildren<{
	actions?: React.ReactNode;
}> &
	React.ComponentPropsWithoutRef<typeof PageTitle>;

export const PageLayout: React.FC<Props> = ({
	actions,
	children,
	knownSubpages,
	title,
}) => (
	<div className="flex h-full flex-col">
		<main className="flex flex-1 flex-col gap-4">
			<div className="flex items-center justify-between border-b-3 border-stone-400 p-1">
				<PageTitle knownSubpages={knownSubpages} title={title} />
				{actions ? (
					<div className="flex items-center gap-2">{actions}</div>
				) : null}
			</div>
			{children}
		</main>
	</div>
);
