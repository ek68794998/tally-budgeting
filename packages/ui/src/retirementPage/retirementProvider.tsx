"use client";

import { useLocalStorageState } from "ahooks";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import {
	calculateRetirementData,
	getDefaultRetirementCalculatorInputs,
} from "./helpers";
import { type RetirementCalculatorInputs, type RetirementData } from "./types";

interface RetirementContextValue {
	calculatedData: RetirementData;
	inputs: RetirementCalculatorInputs;
	setInputs: (inputs: RetirementCalculatorInputs) => void;
}

const RetirementContext = createContext<RetirementContextValue | undefined>(
	undefined,
);

const year = new Date().getFullYear();
const monthsLeftInYear = 12 - new Date().getMonth();

export const RetirementProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const [storedInputs, setStoredInputs] = useLocalStorageState(
		"retirement-calculator-inputs",
		{ defaultValue: getDefaultRetirementCalculatorInputs() },
	);

	const [inputs, setInputs] = useState(storedInputs);

	const handleInputsUpdate = useCallback(
		(newInputs: RetirementCalculatorInputs) => {
			setInputs(newInputs);
			setStoredInputs(newInputs);
		},
		[setStoredInputs],
	);

	const value = useMemo(
		(): RetirementContextValue => ({
			calculatedData: calculateRetirementData(
				inputs,
				year,
				monthsLeftInYear,
			),
			inputs,
			setInputs: handleInputsUpdate,
		}),
		[handleInputsUpdate, inputs],
	);

	return (
		<RetirementContext.Provider value={value}>
			{children}
		</RetirementContext.Provider>
	);
};

export const useRetirementContext = () => {
	const context = useContext(RetirementContext);

	if (!context) {
		throw new Error(
			"useRetirementContext must be used within a RetirementProvider",
		);
	}

	return context;
};
