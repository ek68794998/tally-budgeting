import { create } from "zustand";

export interface DatabaseStatusStore {
	clear: () => void;
	isUnavailable: boolean;
	markUnavailable: () => void;
}

export const useDatabaseStatusStore = create<DatabaseStatusStore>((set) => ({
	clear: () => set({ isUnavailable: false }),
	isUnavailable: false,
	markUnavailable: () => set({ isUnavailable: true }),
}));
