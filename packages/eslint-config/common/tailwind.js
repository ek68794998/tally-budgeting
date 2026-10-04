import betterTailwindCss from "eslint-plugin-better-tailwindcss";

/**
 * A custom ESLint configuration for Tailwind CSS.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfigTailwind = [
  betterTailwindCss.configs.recommended,
  {
    rules: {
      "better-tailwindcss/enforce-consistent-line-wrapping": [
        "warn",
        {
          indent: 2,
          strictness: "loose",
        },
      ],
      "better-tailwindcss/no-unknown-classes": [
        "error",
        {
          // Unlike eslint-plugin-tailwindcss, class names are matched including their variants (e.g., `hover:`)
          ignore: [
            // Hero UI
            "^(?:[^:\\s]+:)*(text|bg|border|ring|shadow|outline|divide|placeholder|caret|accent)-(default|background|divider)(-[0-9]+)?(/[0-9]+)?$",
            "^(?:[^:\\s]+:)*(text|bg|border|ring|shadow|outline|divide|placeholder|caret|accent)-(primary|secondary|danger|warning|success)(-[0-9]+)?(/[0-9]+)?$",
          ],
        },
      ],
    },
  },
];
