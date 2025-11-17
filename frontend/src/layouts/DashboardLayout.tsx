"use client";

import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import SidebarComponent from "@/pages/homepage/SidebarComponent";
import {
  authAtom,
  clearAuthAtom,
  isAuthenticatedAtom,
} from "@/atom/authAtom";

const navigation = [
  { label: "Posts", to: "/posts" },
  { label: "Groups", to: "/groups" },
  { label: "Profile", to: "/profile" },
  { label: "Search", to: "/search" },
  { label: "Settings", to: "/settings" },
];

export default function DashboardLayout() {
  const authState = useAtomValue(authAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const clearAuth = useSetAtom(clearAuthAtom);
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const displayName =
    authState.user?.firstName || authState.user?.lastName
      ? `${authState.user?.firstName ?? ""} ${
          authState.user?.lastName ?? ""
        }`.trim()
      : authState.user?.username ?? "Guest";

  const subtitle = authState.user?.email ?? "Welcome back";

  const handleLogout = React.useCallback(() => {
    setIsLoggingOut(true);
    clearAuth();
    navigate("/signin", { replace: true });
  }, [clearAuth, navigate]);

  if (!isAuthenticated) {
    return <Navigate replace to="/signin" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#fff3e0] via-[#ffe6f2] to-[#ffd1dc] px-4 py-10 text-neutral-900 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid w-full gap-6 rounded-[48px] border border-rose-100 bg-white/95 p-6 shadow-xl shadow-rose-200/50 backdrop-blur-lg md:grid-cols-[260px_minmax(0,_1fr)] md:p-10">
          <SidebarComponent
            isLoggingOut={isLoggingOut}
            navigation={navigation}
            onLogout={handleLogout}
            user={{
              name: displayName,
              title: subtitle,
            }}
          />
          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </main>
  );
}


