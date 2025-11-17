"use client";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export type AuthTokens = {
    access: string;
    refresh: string;
};

export type AuthUser = {
    id: number;
    username: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    profilePicture?: string | null;
    friends?: number[];
};

export type AuthState = {
    tokens: AuthTokens | null;
    user: AuthUser | null;
};

export const AUTH_STORAGE_KEY = "aceternity-auth";

export const defaultAuthState: AuthState = {
    tokens: null,
    user: null,
};

const storage = typeof window === "undefined"
    ? undefined
    : createJSONStorage<AuthState>(() => window.localStorage);

export const authAtom = atomWithStorage<AuthState>(
    AUTH_STORAGE_KEY,
    defaultAuthState,
    storage,
);

export const isAuthenticatedAtom = atom((get) => {
    const state = get(authAtom);
    return Boolean(state.tokens?.access);
});

export const setAuthAtom = atom(null, (_get, set, value: AuthState) => {
    set(authAtom, value);
});

export const clearAuthAtom = atom(null, (_get, set) => {
    set(authAtom, defaultAuthState);
});

export const updateAuthAtom = atom(
    null,
    (get, set, updater: (previous: AuthState) => AuthState) => {
        const next = updater(get(authAtom));
        set(authAtom, next);
    },
);
