"use client";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import CardComponent from "@/pages/homepage/CardComponent";
import type { LucideIcon } from "lucide-react";

type NavigationItem = {
  label: string;
  to: string;
  icon?: LucideIcon;
};

type SidebarComponentProps = {
  navigation: NavigationItem[];
  user: {
    name: string;
    title: string;
  };
  onLogout?: () => void;
  isLoggingOut?: boolean;
};

export default function SidebarComponent({
  navigation,
  user,
  onLogout,
  isLoggingOut = false,
}: SidebarComponentProps) {
  return (
    <CardComponent className="sticky top-6 flex h-fit flex-col overflow-hidden p-5">
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#bc1888] text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.title}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#bc1888]">
            Navigation
          </p>
        </div>
        <nav className="space-y-3 pr-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                    isActive
                      ? "border-[#f9a8d4] bg-[#fff0f5] text-[#bc1888]"
                      : "border-transparent text-neutral-600 hover:border-[#f9a8d4] hover:bg-[#fff0f5] hover:text-[#bc1888]",
                  )
                }
                key={item.label}
                to={item.to}
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3">
                      {Icon && <Icon className="h-5 w-5" />}
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium text-[#f39c6b] opacity-0 transition",
                        isActive ? "opacity-100" : "group-hover:opacity-100",
                      )}
                    >
                      →
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Section */}
        {onLogout && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={onLogout}
              disabled={isLoggingOut}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                "border-transparent bg-[#bc1888] text-white hover:bg-[#a01672] disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoggingOut ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </button>
          </div>
        )}
      </div>
    </CardComponent>
  );
}

