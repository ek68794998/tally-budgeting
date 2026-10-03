import { create } from "zustand";

export interface SessionStore {
	clear: () => void;
	isExpired: boolean;
	markExpired: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
	clear: () => set({ isExpired: false }),
	isExpired: false,
	markExpired: () => set({ isExpired: true }),
}));
