import React from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import {
    authAtom,
    clearAuthAtom,
    isAuthenticatedAtom,
    updateAuthAtom,
} from "../atom/authAtom";
import { ApiError } from "../lib/apiClient";
import { refreshTokens } from "@/lib/auth";

export function useAuthedRequest() {
    const authState = useAtomValue(authAtom);
    const isAuthenticated = useAtomValue(isAuthenticatedAtom);
    const clearAuth = useSetAtom(clearAuthAtom);
    const updateAuth = useSetAtom(updateAuthAtom);
    const navigate = useNavigate();

    const requestWithRefresh = React.useCallback(
        async <T>(request: (accessToken: string) => Promise<T>): Promise<T> => {
            const tokens = authState.tokens;

            if (!tokens?.access) {
                throw new Error("Please sign in again to continue.");
            }

            try {
                return await request(tokens.access);
            } catch (error) {
                if (
                    error instanceof ApiError &&
                    error.status === 401 &&
                    tokens.refresh
                ) {
                    try {
                        const newTokens = await refreshTokens(tokens.refresh);
                        updateAuth((previous) => ({
                            ...previous,
                            tokens: newTokens,
                        }));
                        return await request(newTokens.access);
                    } catch {
                        clearAuth();
                        navigate("/signin", { replace: true });
                        throw new Error(
                            "Your session expired. Please sign in again.",
                        );
                    }
                }

                throw error;
            }
        },
        [authState.tokens, clearAuth, navigate, updateAuth],
    );

    return {
        authState,
        isAuthenticated,
        requestWithRefresh,
    };
}
