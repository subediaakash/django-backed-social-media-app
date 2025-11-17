"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FeedComponent from "@/pages/homepage/FeedComponent";
import PeopleYouMayKnowComponent from "@/pages/homepage/PeopleYouMayKnowComponent";
import { ApiError, apiRequest } from "@/lib/apiClient";
import { useAuthedRequest } from "@/hooks/useAuthedRequest";
import type { Post } from "@/types/posts";

const suggestions = [
  { name: "Ram Prasad", mutuals: "4 mutuals" },
  { name: "Hari Prasad", mutuals: "2 mutuals" },
  { name: "Bom Lam", mutuals: "Just joined" },
];

export default function HomePage() {
  const { authState, isAuthenticated, requestWithRefresh } = useAuthedRequest();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

  if (!isAuthenticated) {
    return null;
  }

  const displayName =
    authState.user?.firstName || authState.user?.lastName
      ? `${authState.user?.firstName ?? ""} ${authState.user?.lastName ?? ""}`.trim()
      : authState.user?.username ?? "Guest";

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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_1fr)_280px]">
      <div className="min-w-0">
        <FeedComponent
          createError={createPostError}
          currentUserAvatarUrl={authState.user?.profilePicture ?? null}
          currentUserDisplayName={displayName}
          currentUserHandle={userHandle}
          isCreatingPost={isCreatingPost}
          isLoading={postsQuery.isLoading}
          loadError={postsError}
          onCreatePost={handleCreatePost}
          posts={posts}
        />
      </div>
      <PeopleYouMayKnowComponent suggestions={suggestions} />
    </div>
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
