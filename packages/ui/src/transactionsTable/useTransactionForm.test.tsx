import { CalendarDate } from "@internationalized/date";
import { buildTransaction } from "@tally/data-models/testing/fixtures";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTransactionForm } from "./useTransactionForm";

interface FormChangeCase {
  apply: (form: ReturnType<typeof useTransactionForm>) => void;
  name: string;
}

const coffee = buildTransaction({
  accountId: 2,
  amountCents: 4_50,
  date: "2025-01-15T12:00:00.000Z",
  happiness: 3,
  notes: "latte",
});

describe("useTransactionForm", () => {
  it("loads the transaction when the modal opens and round-trips it", () => {
    const { result } = renderHook(() => useTransactionForm(coffee, true));

    expect(result.current).toMatchObject({
      accountId: 2,
      amount: 4.5,
      canSave: true,
      happiness: 3,
      merchantName: "Coffee Shop",
      notes: "latte",
      subcategoryId: 1,
      transactionType: "debit",
    });
    expect(result.current.buildTransaction()).toEqual({
      ...coffee,
      date: "2025-01-15T12:00:00Z",
    });
  });

  it.each<FormChangeCase>([
    { apply: (form) => form.setAccountId(-1), name: "no account" },
    { apply: (form) => form.setAmount(0), name: "a zero amount" },
    { apply: (form) => form.setDate(null), name: "no date" },
    { apply: (form) => form.setMerchantName(""), name: "no merchant" },
  ])("cannot save with $name", ({ apply }) => {
    const { result } = renderHook(() => useTransactionForm(coffee, true));

    act(() => {
      apply(result.current);
    });

    expect(result.current.canSave).toBe(false);
  });

  it("builds an edited transaction, keeping the original date when cleared", () => {
    const { result } = renderHook(() => useTransactionForm(coffee, true));

    act(() => {
      result.current.setDate(null);
      result.current.setAmount(12.34);
      result.current.setMerchantName("Bakery");
      result.current.setNotes("");
      result.current.setSubcategoryId(9);
      result.current.setTransactionType("credit");
    });

    expect(result.current.buildTransaction()).toEqual({
      ...coffee,
      amountCents: 12_34,
      merchant: "Bakery",
      notes: "",
      subcategoryId: 9,
      type: "credit",
    });

    act(() => {
      result.current.setDate(new CalendarDate(2025, 2, 3));
    });

    expect(result.current.buildTransaction().date).toBe("2025-02-03T12:00:00Z");
  });

  it("saves an edited happiness level", () => {
    const { result } = renderHook(() => useTransactionForm(coffee, true));

    act(() => {
      result.current.setHappiness(1);
    });

    expect(result.current.buildTransaction().happiness).toBe(1);
  });

  it("resets amount, happiness, and notes for the next transaction", () => {
    const { result } = renderHook(() => useTransactionForm(coffee, true));

    act(() => {
      result.current.resetForNextTransaction();
    });

    expect(result.current).toMatchObject({
      amount: 0,
      happiness: 2,
      merchantName: "Coffee Shop",
      notes: "",
    });
  });

  it("treats a transaction without an account as unset and stays empty while closed", () => {
    const withoutAccount = { ...coffee, accountId: undefined };
    const { result: open } = renderHook(() =>
      useTransactionForm(withoutAccount, true),
    );
    const { result: closed } = renderHook(() =>
      useTransactionForm(coffee, false),
    );

    expect(open.current.accountId).toBe(-1);
    expect(closed.current.merchantName).toBe("");
    expect(() =>
      renderHook(() =>
        useTransactionForm(null, true),
      ).result.current.buildTransaction(),
    ).toThrow("Transaction must be defined.");
  });
});
