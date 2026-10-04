import { type MDXComponents } from "mdx/types";
import { type ComponentProps } from "react";

const helpComponents: MDXComponents = {
  a: ({ children, href }: ComponentProps<"a">) => (
    <a className="text-primary underline" href={href}>
      {children}
    </a>
  ),
  code: ({ children }: ComponentProps<"code">) => (
    <code className="rounded-sm bg-default-100 px-1 font-mono text-sm">
      {children}
    </code>
  ),
  h2: ({ children }: ComponentProps<"h2">) => (
    <h2
      className="
        mt-4 mb-1 text-xl font-bold
        first:mt-0
      "
    >
      {children}
    </h2>
  ),
  h3: ({ children }: ComponentProps<"h3">) => (
    <h3 className="mt-3 mb-1 text-lg font-bold">{children}</h3>
  ),
  li: ({ children }: ComponentProps<"li">) => (
    <li className="mb-1">{children}</li>
  ),
  ol: ({ children }: ComponentProps<"ol">) => (
    <ol className="mb-3 list-decimal pl-5">{children}</ol>
  ),
  p: ({ children }: ComponentProps<"p">) => <p className="mb-3">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  ul: ({ children }: ComponentProps<"ul">) => (
    <ul className="mb-3 list-disc pl-5">{children}</ul>
  ),
};

export const useMDXComponents = (components: MDXComponents): MDXComponents => ({
  ...components,
  ...helpComponents,
});
