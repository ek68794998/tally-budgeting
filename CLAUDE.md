# CLAUDE.md

This file provides project-specific guidance for Claude Code. Update this file whenever Claude does something incorrectly so it learns not to repeat mistakes.

## Project Overview

Tally is a self-hosted budgeting application built with Next.js, TypeScript, and PostgreSQL. It's a monorepo managed by Turbo and PNPM, with a focus on privacy-conscious personal finance management.

## Development Workflow

Give Claude verification loops for 2-3x quality improvement:

1. Make changes
2. Run type check
3. Run linting
4. Run tests with coverage

## Commands Reference

### Testing

```bash
pnpm test                            # Run all tests once
pnpm test "packages/<package name>"  # Run test files in a specific package
pnpm test "<pattern>"                # Run test files matching a pattern
pnpm test:watch                      # Run tests in watch mode
pnpm test:ui                         # Open Vitest UI
pnpm test:coverage                   # Generate coverage report
```

### Code Quality

```bash
pnpm check-types  # Type-check all packages
pnpm lint         # Run ESLint and Biome
pnpm fix:biome    # Auto-fix Biome formatting
```

## Code Style & Conventions

All generated code must past type checks and linting.

- Prefer `interface` over `type`; never use `enum` (use string literal unions instead).
- Prefer `const` lambda variables to `function` declarations (as both locals and members).
- Use descriptive variable names.
- Keep functions small and focused.
- Write tests for new functionality.
- Handle errors explicitly (okay to fill `catch` in with TODO if you're not sure); don't swallow them.
- Use comments in code ONLY IF the code is missing something (i.e., TODO), or the code is unusual, unconventional, or difficult to understand.
- When generating unit tests, exercise the following principles:
    - Minimal mocking: Mock only the bare minimum required; do NOT mock dependencies simply to make writing the test easier
    - Component mocking: When making unit tests for components, all nested components should be mocked with either:
        - A **string mock** when building snapshot tests. (Example: `vi.mock('./whatever', () => ({ WhateverComponent: "WhateverComponent" }))`)
        - A **stub mock** in all other cases: interaction, assertion on props passed to the child (using `expect.toHaveBeenCalledWith`), querying something in the child to see which assets were passed through the props, etc. (Example: `vi.mock('./whatever', () => ({ WhateverComponent: () => <div data-testid="whatever" /> }))`)
    - Reduce redundancy: After writing one or more unit tests, analyze the file to determine if there are any cases in which `it.each` would help reduce redundant test cases, AND check if there are any cases where the Arrange + Act blocks of a test are similar or the same and then merge the Assert blocks as well.

## Things Claude Should NOT Do

- Don't add imports before adding the code (because it will be deleted by the linter); always write code first and imports second, OR at the same time
- Don't add comments to silence linting or type checks unless explicitly instructed to do so
- Don't skip error handling
- Don't make breaking API changes without discussion
- Don't create "example" files illustrating usage; test files should be sufficiently descriptive to illustrate usage

## Project-Specific Patterns

- The web app doesn't use path aliases like `@/`. All imports are relative or workspace references.
