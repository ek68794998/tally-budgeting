"use client";

import {
	isSuccessHttpStatusCode,
	Post,
} from "@ekumlin/typescript-toolkit/http";
import {
	type PostTransactionsUploadRequest,
	type PostTransactionsUploadResponse,
} from "@tally/data-models/contracts/api/postTransactionsUpload";
import { type Asset } from "@tally/data-models/contracts/asset";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { buildFormData } from "../forms/helpers";

interface TransactionsUploadCallbacks {
	onSelectNone: () => void;
	onUploadFinish: (
		responseText: string,
		status: number,
		statusText: string,
	) => void;
	onUploadProgress: (progressPercent: number) => void;
	onUploadStart: (file: File) => void;
}

interface TransactionsUploadContextValue {
	account: Asset | null;
	selectedFile: File | null;
	setAccount: (account: Asset | null) => void;
	setSelectedFile: (file: File | null) => void;
	setUploadCallbacks: (callbacks: TransactionsUploadCallbacks) => void;
	setUploadResponse: (
		response: PostTransactionsUploadResponse | null,
	) => void;
	uploadFile: (
		file: File | null,
		isValidationOnly: boolean,
	) => Promise<boolean>;
	uploadResponse: PostTransactionsUploadResponse | null;
	uploadSelectedFile: (isValidationOnly: boolean) => Promise<boolean>;
}

const TransactionsUploadContext = createContext<
	TransactionsUploadContextValue | undefined
>(undefined);

/** Resolves to whether the upload completed with a success status code. */
const uploadFile = (
	file: File | null,
	account: Asset | null,
	isValidationOnly: boolean,
	callbacks: TransactionsUploadCallbacks | null,
): Promise<boolean> => {
	const { onSelectNone, onUploadFinish, onUploadProgress, onUploadStart } =
		callbacks ?? {};

	if (!file || !account) {
		onSelectNone?.();
		return Promise.resolve(false);
	}

	onUploadStart?.(file);

	const formBody: PostTransactionsUploadRequest = {
		accountId: String(account.id),
		file,
		isValidationOnly: isValidationOnly ? "true" : "false",
	};

	const formData = buildFormData(formBody);

	return new Promise((resolve) => {
		const xhr = new XMLHttpRequest();

		xhr.upload.onprogress = (event) => {
			const percentage = (event.loaded / event.total) * 100;
			onUploadProgress?.(percentage);
		};

		xhr.onreadystatechange = () => {
			if (xhr.readyState !== XMLHttpRequest.DONE) {
				return;
			}

			onUploadFinish?.(xhr.responseText, xhr.status, xhr.statusText);
			resolve(isSuccessHttpStatusCode(xhr.status));
		};

		xhr.open(Post, "/api/transactions/upload");
		xhr.send(formData);
	});
};

export const TransactionsUploadProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const [account, setAccount] = useState<Asset | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadCallbacks, setUploadCallbacks] =
		useState<TransactionsUploadCallbacks | null>(null);
	const [uploadResponse, setUploadResponse] =
		useState<PostTransactionsUploadResponse | null>(null);

	const handleFileUpload = useCallback(
		(file: File | null, isValidationOnly: boolean) => {
			setUploadResponse(null);

			if (!file) {
				return Promise.resolve(false);
			}

			return uploadFile(file, account, isValidationOnly, uploadCallbacks);
		},
		[account, uploadCallbacks],
	);

	const value = useMemo(
		(): TransactionsUploadContextValue => ({
			account,
			selectedFile,
			setAccount,
			setSelectedFile,
			setUploadCallbacks,
			setUploadResponse,
			uploadFile: handleFileUpload,
			uploadResponse,
			uploadSelectedFile: (isValidationOnly) =>
				handleFileUpload(selectedFile, isValidationOnly),
		}),
		[account, handleFileUpload, selectedFile, uploadResponse],
	);

	return (
		<TransactionsUploadContext.Provider value={value}>
			{children}
		</TransactionsUploadContext.Provider>
	);
};

export const useTransactionsUploadContext = () => {
	const context = useContext(TransactionsUploadContext);

	if (!context) {
		throw new Error(
			"useTransactionsUploadContext must be used within a TransactionsUploadProvider",
		);
	}

	return context;
};
