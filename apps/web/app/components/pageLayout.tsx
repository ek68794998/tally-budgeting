type Props = React.PropsWithChildren<{
	actions?: React.ReactNode;
	title: string;
}>;

export const PageLayout: React.FC<Props> = ({ actions, children, title }) => (
	<div className="flex h-full flex-col">
		<main className="flex flex-1 flex-col gap-4">
			<div className="flex items-center justify-between border-b-3 border-stone-400 p-1">
				<h1 className="text-4xl font-black">
					<div>{title}</div>
				</h1>
				{actions ? (
					<div className="flex items-center gap-2">{actions}</div>
				) : null}
			</div>
			{children}
		</main>
	</div>
);
