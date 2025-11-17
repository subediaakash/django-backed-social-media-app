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
      </div>
    </CardComponent>
  );
}

