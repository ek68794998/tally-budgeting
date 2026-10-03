"use client";

import { createContext, useContext } from "react";

const AuthContext = createContext({ isAuthEnabled: true });

export const AuthProvider: React.FC<
	React.PropsWithChildren<{ isAuthEnabled: boolean }>
> = ({ children, isAuthEnabled }) => (
	<AuthContext value={{ isAuthEnabled }}>{children}</AuthContext>
);

export const useAuth = () => useContext(AuthContext);
