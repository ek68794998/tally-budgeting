import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "./authContext";

describe("AuthProvider", () => {
	it.each([true, false])("exposes isAuthEnabled=%s", (isAuthEnabled) => {
		const { result } = renderHook(useAuth, {
			wrapper: ({ children }) => (
				<AuthProvider isAuthEnabled={isAuthEnabled}>
					{children}
				</AuthProvider>
			),
		});

		expect(result.current).toEqual({ isAuthEnabled });
	});
});
