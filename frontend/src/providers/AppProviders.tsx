"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import {
  AUTH_STORAGE_KEY,
  defaultAuthState,
  setAuthAtom,
  type AuthState,
} from "@/atom/authAtom";

type AppProvidersProps = {
  children: React.ReactNode;
};

function AuthHydrator({ children }: AppProvidersProps) {
  const setAuth = useSetAtom(setAuthAtom);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      setIsHydrated(true);
      return;
    }

    const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (storedValue) {
      try {
        const parsed = JSON.parse(storedValue) as AuthState;
        setAuth({
          tokens: parsed.tokens ?? defaultAuthState.tokens,
          user: parsed.user ?? defaultAuthState.user,
        });
      } catch (error) {
        console.warn("Unable to hydrate auth state from storage", error);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuth(defaultAuthState);
      }
    } else {
      setAuth(defaultAuthState);
    }

    setIsHydrated(true);
  }, [setAuth]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm text-neutral-500">
        Loading your Aceternity space...
      </div>
    );
  }

  return <>{children}</>;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>{children}</AuthHydrator>
    </QueryClientProvider>
  );
}

