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
  { label: "Friends", to: "/friends" },
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
    <main className="flex min-h-screen justify-center bg-linear-to-br from-[#fff3e0] via-[#ffe6f2] to-[#ffd1dc] px-4 py-6 text-neutral-900 sm:px-8 sm:py-10">
      <div className="relative mx-auto flex w-full max-w-7xl flex-1">
        <div className="grid h-[calc(100vh-3rem)] w-full gap-6 rounded-[48px] border border-rose-100 bg-white/95 p-4 shadow-xl shadow-rose-200/50 backdrop-blur-lg sm:h-[calc(100vh-4rem)] sm:p-8 md:grid-cols-[260px_minmax(0,_1fr)]">
          <SidebarComponent
            isLoggingOut={isLoggingOut}
            navigation={navigation}
            onLogout={handleLogout}
            user={{
              name: displayName,
              title: subtitle,
            }}
          />
          <section className="min-w-0 overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <div className="min-h-full space-y-6 p-2 sm:p-4 lg:p-6">
                  <Outlet />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}


