"use client";

import { TransactionsUploadAccount } from "./transactionsUploadAccount";
import { TransactionsUploadProvider } from "./transactionsUploadProvider";
import { TransactionsUploadResult } from "./transactionsUploadResult";
import { TransactionsUploadWidget } from "./transactionsUploadWidget";

export const TransactionsUploadForm: React.FC = () => (
  <TransactionsUploadProvider>
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <TransactionsUploadAccount />
      <TransactionsUploadWidget />
      <TransactionsUploadResult />
    </div>
  </TransactionsUploadProvider>
);
