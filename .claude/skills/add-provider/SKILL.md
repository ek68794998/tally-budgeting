---
name: add-provider
description: This skill should be used when the user asks to "add a provider", "add a new data provider", "add a new account provider", "integrate a new CSV provider", or names a specific financial institution to integrate (e.g., "add Schwab as a provider", "add Vanguard support").
version: 1.0.0
---

# Add Provider Skill

Adds a new CSV-based account data provider to Tally. There are 9 touch points across 4 packages; this skill covers all of them.

## Inputs Needed from User

Before starting, confirm:
- **Provider ID** — camelCase, unique key (e.g., `vestwell`, `firstTechFederal`)
- **Provider display name** — human-readable (e.g., `"Vestwell"`, `"First Tech Federal Credit Union"`)
- **CSV column schema** — the column headers from the provider's exported CSV file
- **SVG logo** — the provider's logo as an SVG path (or a description so one can be sourced)
- **Brand background color** — hex color for the icon tile (e.g., `#004dff`)

## Step-by-Step Implementation

### 1. Register the provider type

File: `packages/data-models/src/contracts/accountProviderType.ts`

Add the new ID (alphabetical order) to the zod enum:

```ts
export const accountProviderTypeSchema = z.enum([
  "apple",
  // ... existing entries ...
  "newProvider",  // ← add here
]);
```

### 2. Add provider metadata

File: `packages/data-models/src/data/accountProviders.ts`

Add an entry (alphabetical order) to `AccountProviders`:

```ts
newProvider: {
  id: "newProvider",
  name: "New Provider Display Name",
},
```

### 3. Create the SVG logo component

File: `packages/ui/src/images/newProviderLogo.tsx`

**Case-by-case:** measure the SVG viewBox, original dimensions, and path data from the provider's logo.

```tsx
import { type SVGProps } from "react";
import { getScaledLogoSize } from "./helpers";
import { type LogoImageProps } from "./types";

type Props = LogoImageProps & SVGProps<SVGSVGElement>;

const viewBoxOffsetX = 0;
const viewBoxOffsetY = 0;
const originalHeightPx = 24;  // ← adjust to actual logo dimensions
const originalWidthPx = 24;   // ← adjust to actual logo dimensions

export const NewProviderLogoSvg: React.FC<Props> = (props) => {
  const { containerHeight, containerWidth, ...svgProps } = props;

  const [scaledWidthPx, scaledHeightPx] =
    getScaledLogoSize(
      originalWidthPx,
      originalHeightPx,
      containerWidth,
      containerHeight,
    ) ?? [];

  const svgHeightPx = scaledHeightPx || props.height || originalHeightPx;
  const svgWidthPx = scaledWidthPx || props.width || originalWidthPx;

  return (
    <svg
      height={svgHeightPx}
      viewBox={`${viewBoxOffsetX} ${viewBoxOffsetY} ${originalWidthPx} ${originalHeightPx}`}
      width={svgWidthPx}
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <title>{"New Provider Logo"}</title>
      {/* ← paste SVG path(s) here */}
      <path d="..." fill="#fff" />
    </svg>
  );
};
```

### 4. Create the icon component

File: `packages/ui/src/dataProviderIcons/newProviderIcon.tsx`

**Case-by-case:** set `bg-[#XXXXXX]` to the provider's brand color.

```tsx
import { NewProviderLogoSvg } from "../images/newProviderLogo";
import { type DataProviderIconProps } from "./types";

type Props = DataProviderIconProps;

export const NewProviderIcon: React.FC<Props> = ({ containerSizePx, sizePx }) => (
  <div
    className="flex items-center justify-center rounded-sm bg-[#XXXXXX]"
    style={{
      height: containerSizePx,
      width: containerSizePx,
    }}
  >
    <NewProviderLogoSvg containerHeight={sizePx} containerWidth={sizePx} />
  </div>
);
```

### 5. Create the icon snapshot test

File: `packages/ui/src/dataProviderIcons/newProviderIcon.test.tsx`

**Boilerplate — substitute component names only:**

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewProviderIcon } from "./newProviderIcon";

vi.mock("../images/newProviderLogo", () => ({
  NewProviderLogoSvg: vi.fn(() => "(react:NewProviderLogoSvg)"),
}));

describe("NewProviderIcon", () => {
  it("renders correctly", () => {
    const { container } = render(
      <NewProviderIcon containerSizePx={30} sizePx={24} />,
    );
    expect(container).toMatchSnapshot();
  });
});
```

### 6. Wire the icon into the dispatcher

File: `packages/ui/src/dataProviderIcons/dataProviderIcon.tsx`

Add the import alongside the others (alphabetical):

```ts
import { NewProviderIcon } from "./newProviderIcon";
```

Add a case to the switch (alphabetical within the switch):

```tsx
case "newProvider":
  return (
    <NewProviderIcon containerSizePx={containerSizePx} sizePx={sizePx} />
  );
```

### 7. Create the data provider class

File: `packages/utilities/src/dataProviders/newProvider.ts`

**Case-by-case:** define the zod schema from the CSV headers, map the fields, and implement parsing logic. Use the `amountCents < 0 ? "debit" : "credit"` convention for transaction type.

```ts
import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DefaultSubcategory } from "@tally/data-models/contracts/subcategory";
import { z } from "zod";
import { parseDescription } from "../dataHandlers/parseDescription";
import { Dollars } from "../financial/dollars";
import { validateIsStatementRow } from "./helpers";
import {
  type CsvRowToTransactionFn,
  type DataProvider,
  type ValidationErrorFn,
} from "./types";

const statementRowSchema = z.object({
  /* eslint-disable @typescript-eslint/naming-convention */
  "Column Name": z.string().min(1),  // ← replace with actual CSV columns
  // ...
  /* eslint-enable @typescript-eslint/naming-convention */
});

type StatementRow = z.infer<typeof statementRowSchema>;

export class NewProviderDataProvider implements DataProvider<StatementRow> {
  public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
    (inputRow, accountName, customizations) => {
      const { accounts, subcategories } = customizations;

      const description = inputRow["Description Column"].trim();  // ← adjust field
      const { merchant, subcategoryId } = parseDescription(
        description,
        customizations,
      );

      const account = accounts.find(
        (a) => a.name === accountName && a.provider === "newProvider",
      );
      invariant(
        account,
        `Account with name '${accountName}' not found or does not match provider.`,
      );

      const subcategory =
        subcategories.find((s) => s.id === subcategoryId) ??
        DefaultSubcategory;

      const amountCents = Dollars.toCents(
        inputRow["Amount Column"].replace(/[$,]/g, ""),  // ← adjust field + cleanup
      );

      return {
        accountId: account.id,
        amountCents: Math.abs(amountCents),
        categoryId: subcategory.categoryId,
        date: new Date(inputRow["Date Column"]).toISOString(),  // ← adjust field
        merchant,
        subcategoryId: subcategory.id,
        type: amountCents < 0 ? "debit" : "credit",
      };
    };

  public isStatementRowIgnored = (_inputRow: StatementRow) => false;

  public validateIsStatementRow: ValidationErrorFn<StatementRow> = (
    obj,
    validationErrors,
  ): obj is StatementRow =>
    validateIsStatementRow(obj, statementRowSchema, validationErrors);
}
```

### 8. Create the data provider tests

File: `packages/utilities/src/dataProviders/newProvider.test.ts`

**Case-by-case:** substitute real CSV rows and field names. The test structure below is the canonical pattern — cover all branches.

Key cases to cover:
- Basic credit transaction (positive amount)
- Basic debit transaction (negative amount)
- Merchant matching via `customizations.merchants`
- Default subcategory fallback when no merchant matches
- `isStatementRowIgnored` returns false for all row types (unless the provider actually ignores some)
- `validateIsStatementRow` returns true for valid rows
- `validateIsStatementRow` returns false + populates `validationErrors` for malformed rows (empty required field, missing fields, null, undefined)
- `validateIsStatementRow` does NOT clear a pre-populated errors array
- `convertStatementRowToTransaction` throws when account name not found
- `convertStatementRowToTransaction` throws when account exists but has wrong provider

### 9. Wire the provider into the parser

File: `packages/utilities/src/dataProviders/parser.ts`

Add the import alongside the others (alphabetical):

```ts
import { NewProviderDataProvider } from "./newProvider";
```

Add a case to the switch (alphabetical within the switch):

```tsx
case "newProvider": {
  const provider = new NewProviderDataProvider();

  if (
    provider.validateIsStatementRow(inputRow, validationErrors) &&
    !provider.isStatementRowIgnored(inputRow)
  ) {
    setTransaction(
      provider.convertStatementRowToTransaction(
        inputRow,
        account.name,
        customizations,
      ),
    );
  }

  break;
}
```

## Verification Loop

After implementing all 9 steps, run:

```bash
pnpm check-types
pnpm lint
pnpm test "newProvider"
pnpm test "dataProviderIcon"
```

Fix any errors before reporting done. The `unreachable(account.provider)` call in `parser.ts` and `dataProviderIcon.tsx` will cause a type error until step 1 + the switch case are both complete — that's the exhaustiveness check working correctly.
