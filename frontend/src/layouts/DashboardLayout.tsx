"use client";

import React from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import SidebarComponent from "@/pages/homepage/SidebarComponent";
import {
  authAtom,
  clearAuthAtom,
  isAuthenticatedAtom,
} from "@/atom/authAtom";
import { Home, Users, UsersRound, UserCircle, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Posts", to: "/posts", icon: Home },
  { label: "Friends", to: "/friends", icon: Users },
  { label: "Groups", to: "/groups", icon: UsersRound },
  { label: "Profile", to: "/profile", icon: UserCircle },
  { label: "Search", to: "/search", icon: Search },
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
    <main className="flex min-h-screen flex-col bg-linear-to-br from-[#fff3e0] via-[#ffe6f2] to-[#ffd1dc] text-neutral-900">
      {/* Global Header */}
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/95 shadow-sm backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] shadow-lg">
              <span className="text-xl font-bold text-white">J</span>
            </div>
            <h1 className="bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] bg-clip-text text-2xl font-bold text-transparent">
              JainSocials
            </h1>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888]" />
            <div className="text-sm">
              <p className="font-semibold text-neutral-800">{displayName}</p>
              <p className="text-xs text-neutral-500">{subtitle}</p>
            </div>
            <button
              className="ml-2 rounded-xl border border-rose-100 px-4 py-2 text-sm font-semibold text-[#bc1888] transition hover:border-[#f39c6b] hover:bg-[#ffe6f2] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoggingOut}
              onClick={handleLogout}
              type="button"
            >
              {isLoggingOut ? "..." : "Logout"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <nav className="flex items-center justify-around border-t border-rose-100 bg-white/95 py-2 md:hidden">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition",
                    isActive
                      ? "text-[#bc1888]"
                      : "text-neutral-500 hover:text-[#bc1888]",
                  )
                }
                key={item.label}
                to={item.to}
              >
                {({ isActive }) => (
                  <>
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          isActive && "fill-[#ffe6f2]",
                        )}
                      />
                    )}
                    <span className="text-[10px] font-medium">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
          <button
            className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-neutral-500 transition hover:text-[#bc1888] disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex w-full gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block md:w-64">
            <SidebarComponent
              isLoggingOut={isLoggingOut}
              navigation={navigation}
              onLogout={handleLogout}
              user={{
                name: displayName,
                title: subtitle,
              }}
            />
          </aside>

          {/* Content */}
          <section className="min-w-0 flex-1">
            <div className="rounded-3xl border border-rose-100 bg-white/95 p-4 shadow-xl shadow-rose-200/50 backdrop-blur-lg sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}


