"use client";

import { toError } from "@ekumlin/typescript-toolkit/error";
import {
	isClientErrorHttpStatusCode,
	isSuccessHttpStatusCode,
} from "@ekumlin/typescript-toolkit/http";
import { TextCsv } from "@ekumlin/typescript-toolkit/io";
import {
	addToast,
	Card,
	CardBody,
	Progress,
	type ProgressProps,
} from "@heroui/react";
import { postTransactionsUploadResponseSchema } from "@tally/data-models/contracts/api/postTransactionsUpload";
import { useMount } from "ahooks";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { twMerge } from "tailwind-merge";
import { useTransactionsUploadContext } from "./transactionsUploadProvider";

type FileState = "none" | "uploading" | "valid" | "invalid";

export const TransactionsUploadWidget: React.FC = () => {
	const {
		account,
		selectedFile,
		setSelectedFile,
		setUploadCallbacks,
		setUploadResponse,
		uploadFile,
	} = useTransactionsUploadContext();

	const t = useTranslations("transactions.upload");

	const [fileState, setFileState] = useState<FileState>("none");
	const [fileUploadPercentage, setFileUploadPercentage] = useState(0);

	useMount(() => {
		setUploadCallbacks({
			onSelectNone: () => {
				setSelectedFile(null);
				setFileState("none");
			},
			onUploadFinish: (responseText, status, statusText) => {
				let error: string | undefined;

				if (isSuccessHttpStatusCode(status)) {
					try {
						const responseObject: unknown =
							JSON.parse(responseText);
						const result =
							postTransactionsUploadResponseSchema.parse(
								responseObject,
							);
						setUploadResponse(result);
					} catch (e) {
						error = toError(e).message;
					}
				} else {
					error = t(
						isClientErrorHttpStatusCode(status)
							? "failureBody4XX"
							: "failureBody5XX",
						{ statusCode: status, statusText },
					);
				}

				if (error) {
					addToast({
						color: "danger",
						description: error,
						title: t("failureTitle"),
					});
					setFileState("invalid");
				} else {
					setFileState("valid");
				}
			},
			onUploadProgress: setFileUploadPercentage,
			onUploadStart: (file) => {
				setSelectedFile(file);
				setFileState("uploading");
			},
		});
	});

	const disabled = !account;
	const uploadPercentage = selectedFile ? fileUploadPercentage : 0;
	const progressBarColor: ProgressProps["color"] =
		uploadPercentage < 100 || fileState === "uploading"
			? "default"
			: fileState === "valid"
				? "success"
				: "danger";

	const hintText = t.rich(
		selectedFile ? "dropFileSelected" : "dropFileRules",
		{
			bold: (chunks) => <b>{chunks}</b>,
			fileName: selectedFile ? selectedFile.name : "",
		},
	);

	return (
		<Dropzone
			accept={{
				[TextCsv]: [".csv"],
			}}
			disabled={disabled}
			onDrop={(files) => uploadFile(files[0] ?? null, true)}
		>
			{({ getInputProps, getRootProps, isDragActive, isDragReject }) => (
				<div {...getRootProps()}>
					<Card
						className={twMerge(
							"border-2 border-dashed border-stone-600/5",
							!disabled &&
								"cursor-pointer hover:border-stone-600/50",
							isDragActive &&
								!isDragReject &&
								"border-green-800/50",
						)}
						isBlurred={true}
						isDisabled={disabled}
					>
						<CardBody className="flex flex-col items-center gap-2 p-4">
							<input {...getInputProps()} />
							<p>{t("dropFile")}</p>
							<p className="text-xs">{hintText}</p>
							<Progress
								className="max-w-56"
								color={progressBarColor}
								value={uploadPercentage}
							/>
						</CardBody>
					</Card>
				</div>
			)}
		</Dropzone>
	);
};
