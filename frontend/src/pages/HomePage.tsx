"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authAtom,
  clearAuthAtom,
  isAuthenticatedAtom,
  updateAuthAtom,
} from "@/atom/authAtom";
import FeedComponent from "@/pages/homepage/FeedComponent";
import PeopleYouMayKnowComponent from "@/pages/homepage/PeopleYouMayKnowComponent";
import SidebarComponent from "@/pages/homepage/SidebarComponent";
import { ApiError, apiRequest } from "@/lib/apiClient";
import { refreshTokens } from "@/lib/auth";
import type { Post } from "@/types/posts";

const navigation = [
  { label: "Posts", to: "/feed" },
  { label: "Groups", to: "/groups" },
  { label: "Profile", to: "/profile" },
  { label: "Settings", to: "/settings" },
];

const suggestions = [
  { name: "Ram Prasad", mutuals: "4 mutuals" },
  { name: "Hari Prasad", mutuals: "2 mutuals" },
  { name: "Bom Lam", mutuals: "Just joined" },
];

export default function HomePage() {
  const authState = useAtomValue(authAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const clearAuth = useSetAtom(clearAuthAtom);
  const updateAuth = useSetAtom(updateAuthAtom);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const requestWithRefresh = React.useCallback(
    async <T,>(request: (accessToken: string) => Promise<T>): Promise<T> => {
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
          } catch (refreshError) {
            clearAuth();
            navigate("/signin", { replace: true });
            throw new Error(
              normalizeError(
                refreshError,
                "Your session expired. Please sign in again.",
              ),
            );
          }
        }

        throw error;
      }
    },
    [authState.tokens, clearAuth, navigate, updateAuth],
  );

  const postsQuery = useQuery({
    queryKey: ["posts"],
    enabled: isAuthenticated && Boolean(authState.tokens?.access),
    queryFn: () =>
      requestWithRefresh((accessToken) =>
        apiRequest<Post[]>("/posts/", { authToken: accessToken }),
      ),
  });

  const createPostMutation = useMutation({
    mutationFn: (content: string) =>
      requestWithRefresh((accessToken) =>
        apiRequest<Post, { content: string }>("/posts/", {
          method: "POST",
          body: { content },
          authToken: accessToken,
        }),
      ),
    onSuccess: (newPost) => {
      queryClient.setQueryData<Post[]>(["posts"], (previous) =>
        previous ? [newPost, ...previous] : [newPost],
      );
    },
  });

  const {
    mutateAsync: createPostAsync,
    isPending: isCreatingPost,
    error: createPostErrorRaw,
  } = createPostMutation;

  const handleCreatePost = React.useCallback(
    async (content: string) => {
      await createPostAsync(content);
    },
    [createPostAsync],
  );

  const handleLogout = React.useCallback(() => {
    setIsLoggingOut(true);
    clearAuth();
    navigate("/signin", { replace: true });
  }, [clearAuth, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const displayName =
    authState.user?.firstName || authState.user?.lastName
      ? `${authState.user?.firstName ?? ""} ${authState.user?.lastName ?? ""}`.trim()
      : authState.user?.username ?? "Guest";

  const subtitle = authState.user?.email ?? "Welcome back";
  const userHandle = `@${authState.user?.username ?? "guest"}`;

  const posts = postsQuery.data ?? [];
  const postsError = postsQuery.error
    ? normalizeError(
        postsQuery.error,
        "We couldn't load your feed. Please try again.",
      )
    : null;

  const createPostError = createPostErrorRaw
    ? normalizeError(
        createPostErrorRaw,
        "Unable to share your post. Please try again.",
      )
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#fff3e0] via-[#ffe6f2] to-[#ffd1dc] px-4 py-10 text-neutral-900 sm:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 rounded-[48px] border border-rose-100 bg-white/95 p-6 shadow-xl shadow-rose-200/50 backdrop-blur-lg md:grid-cols-[260px_1fr_280px] md:p-10">
        <SidebarComponent
          navigation={navigation}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          user={{
            name: displayName,
            title: subtitle,
          }}
        />
        <FeedComponent
          createError={createPostError}
          currentUserDisplayName={displayName}
          currentUserHandle={userHandle}
          currentUserAvatarUrl={authState.user?.profilePicture ?? null}
          isCreatingPost={isCreatingPost}
          isLoading={postsQuery.isLoading}
          loadError={postsError}
          onCreatePost={handleCreatePost}
          posts={posts}
        />
        <PeopleYouMayKnowComponent suggestions={suggestions} />
      </div>
    </main>
  );
}

function normalizeError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }
  return fallbackMessage;
}
