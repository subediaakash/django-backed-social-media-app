"use client";
import { Link } from "react-router-dom";
import CardComponent from "@/pages/homepage/CardComponent";

type NavigationItem = {
  label: string;
  to: string;
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
    <CardComponent className="flex h-full flex-col justify-between p-5">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#bc1888]">
            Navigation
          </p>
          <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#ffe6f2] px-3 py-1 text-xs font-medium text-[#bc1888]">
            Aceternity
          </span>
        </div>
        <nav className="space-y-3">
          {navigation.map((item) => (
            <Link
              className="group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:border-[#f9a8d4] hover:bg-[#fff0f5] hover:text-[#bc1888]"
              key={item.label}
              to={item.to}
            >
              {item.label}
              <span className="text-xs font-medium text-[#f39c6b] opacity-0 transition group-hover:opacity-100">
                →
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <CardComponent className="space-y-4 border-none bg-white/80 p-4 text-xs text-neutral-500 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888]" />
          <div>
            <p className="text-sm font-semibold text-neutral-800">{user.name}</p>
            <p>{user.title}</p>
          </div>
        </div>
        <button
          className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl border border-rose-100 text-sm font-semibold text-[#bc1888] transition hover:border-[#f39c6b] hover:bg-[#ffe6f2] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoggingOut}
          onClick={onLogout}
          type="button"
        >
          {isLoggingOut ? "Signing out..." : "Logout"}
        </button>
      </CardComponent>
    </CardComponent>
  );
}

