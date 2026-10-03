import { render, screen } from "@testing-library/react";
import { type MDXComponents } from "mdx/types";
import { describe, expect, it } from "vitest";
import { useMDXComponents } from "./mdx-components";

describe("useMDXComponents", () => {
	it.each([
		"a",
		"code",
		"h2",
		"h3",
		"li",
		"ol",
		"p",
		"strong",
		"ul",
	] as const)("styles <%s> while keeping its content", (tag) => {
		const Component = useMDXComponents({})[tag];

		if (typeof Component !== "function") {
			throw new Error(`Missing component for ${tag}.`);
		}

		render(<Component href="/help">{"Content"}</Component>);

		const element = screen.getByText("Content");
		expect(element.tagName.toLowerCase()).toBe(tag);
		expect(element.className).not.toBe("");
	});

	it("keeps components that it does not override", () => {
		const Blockquote: MDXComponents["blockquote"] = () => null;

		expect(useMDXComponents({ blockquote: Blockquote }).blockquote).toBe(
			Blockquote,
		);
	});
});
