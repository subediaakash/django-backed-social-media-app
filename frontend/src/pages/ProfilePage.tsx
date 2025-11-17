"use client";

import { useAtomValue } from "jotai";
import CardComponent from "@/pages/homepage/CardComponent";
import { authAtom } from "@/atom/authAtom";

export default function ProfilePage() {
  const authState = useAtomValue(authAtom);
  const user = authState.user;

  const displayName =
    user?.firstName || user?.lastName
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : user?.username ?? "Guest";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "G";

  return (
    <div className="space-y-6">
      <CardComponent className="flex flex-col gap-6 p-6">
        <header className="flex items-center gap-4">
          {user?.profilePicture ? (
            <img
              alt={displayName}
              className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-md shadow-rose-200/60"
              src={user.profilePicture}
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-lg font-semibold uppercase text-white shadow-md shadow-rose-200/60">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              {displayName}
            </h1>
            <p className="text-sm text-neutral-500">
              @{user?.username ?? "guest"}
            </p>
          </div>
        </header>

        <section className="space-y-3 text-sm text-neutral-600">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Email
            </p>
            <p>{user?.email ?? "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Bio
            </p>
            <p>{user?.bio ?? "Add a short introduction to share your story."}</p>
          </div>
        </section>
      </CardComponent>
    </div>
  );
}


