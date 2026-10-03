import { type MDXComponents } from "mdx/types";

const helpComponents: MDXComponents = {
	a: ({ children, href }) => (
		<a className="text-primary underline" href={href}>
			{children}
		</a>
	),
	code: ({ children }) => (
		<code className="bg-default-100 rounded-sm px-1 font-mono text-sm">
			{children}
		</code>
	),
	h2: ({ children }) => (
		<h2 className="mt-4 mb-1 text-xl font-bold first:mt-0">{children}</h2>
	),
	h3: ({ children }) => (
		<h3 className="mt-3 mb-1 text-lg font-bold">{children}</h3>
	),
	li: ({ children }) => <li className="mb-1">{children}</li>,
	ol: ({ children }) => (
		<ol className="mb-3 list-decimal pl-5">{children}</ol>
	),
	p: ({ children }) => <p className="mb-3">{children}</p>,
	strong: ({ children }) => (
		<strong className="font-semibold">{children}</strong>
	),
	ul: ({ children }) => <ul className="mb-3 list-disc pl-5">{children}</ul>,
};

export const useMDXComponents = (components: MDXComponents): MDXComponents => ({
	...components,
	...helpComponents,
});
