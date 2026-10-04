import { type Asset } from "@tally/data-models/contracts/asset";
import {
  type Category,
  DefaultCategoryId,
} from "@tally/data-models/contracts/category";
import { HappinessLevelDefault } from "@tally/data-models/contracts/happinessLevel";
import {
  DefaultSubcategoryId,
  type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";

export const ModalDefaultAsset: Readonly<Asset> = {
  active: true,
  id: 0,
  name: "",
  provider: null,
  type: "fixed_asset",
  valueCents: 0,
} as const;

export const ModalDefaultCategory: Readonly<Category> = {
  id: 0,
  label: "",
} as const;

export const ModalDefaultSubcategory: Readonly<Subcategory> = {
  budget: {
    amountCents: 0,
    frequency: 1,
    type: "expense",
  },
  categoryId: DefaultCategoryId,
  description: "",
  id: 0,
  label: "",
  percentNeeds: 0,
  percentSavings: 0,
} as const;

export const ModalDefaultTransaction: Readonly<Transaction> = {
  amountCents: 0,
  categoryId: DefaultCategoryId,
  date: new Date().toISOString(),
  happiness: HappinessLevelDefault,
  id: 0,
  merchant: "",
  notes: "",
  subcategoryId: DefaultSubcategoryId,
  type: "debit",
} as const;

export const ModalDefaultTransactionRule: Readonly<TransactionRule> = {
  active: true,
  id: 0,
  matcher: {
    flags: "i",
    pattern: "",
  },
  merchantName: "",
  priority: 0,
  subcategoryId: DefaultSubcategoryId,
} as const;
