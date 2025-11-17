"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FeedComponent from "@/pages/homepage/FeedComponent";
import PeopleYouMayKnowComponent from "@/pages/homepage/PeopleYouMayKnowComponent";
import { ApiError, apiRequest } from "@/lib/apiClient";
import { useAuthedRequest } from "@/hooks/useAuthedRequest";
import type { Post, PostComment } from "@/types/posts";

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

  const handleToggleLike = React.useCallback(
    async (postId: number) => {
      const response = await requestWithRefresh((accessToken) =>
        apiRequest<{ liked: boolean; likesCount: number; like?: unknown }>(
          `/posts/${postId}/like/`,
          {
            method: "POST",
            authToken: accessToken,
          },
        ),
      );

      queryClient.setQueryData<Post[]>(["posts"], (previous) => {
        if (!previous) {
          return previous;
        }

        return previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: response.likesCount,
                viewerHasLiked: response.liked,
              }
            : post,
        );
      });

      return response;
    },
    [queryClient, requestWithRefresh],
  );

  const handleCreateComment = React.useCallback(
    async (postId: number, content: string) => {
      const newComment = await requestWithRefresh((accessToken) =>
        apiRequest<PostComment, { content: string }>(
          `/posts/${postId}/comments/`,
          {
            method: "POST",
            body: { content },
            authToken: accessToken,
          },
        ),
      );

      queryClient.setQueryData<Post[]>(["posts"], (previous) => {
        if (!previous) {
          return previous;
        }

        return previous.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          const nextComments = [...post.comments, newComment].sort((a, b) =>
            a.createdAt.localeCompare(b.createdAt),
          );

          return {
            ...post,
            comments: nextComments,
            commentsCount: post.commentsCount + 1,
          };
        });
      });

      return newComment;
    },
    [queryClient, requestWithRefresh],
  );

  const handleUpdateComment = React.useCallback(
    async (postId: number, commentId: number, content: string) => {
      const updatedComment = await requestWithRefresh((accessToken) =>
        apiRequest<PostComment, { content: string }>(
          `/posts/${postId}/comments/${commentId}/`,
          {
            method: "PATCH",
            body: { content },
            authToken: accessToken,
          },
        ),
      );

      queryClient.setQueryData<Post[]>(["posts"], (previous) => {
        if (!previous) {
          return previous;
        }

        return previous.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          return {
            ...post,
            comments: post.comments.map((comment) =>
              comment.id === commentId ? updatedComment : comment,
            ),
          };
        });
      });

      return updatedComment;
    },
    [queryClient, requestWithRefresh],
  );

  const handleDeleteComment = React.useCallback(
    async (postId: number, commentId: number) => {
      await requestWithRefresh((accessToken) =>
        apiRequest<unknown>(
          `/posts/${postId}/comments/${commentId}/`,
          {
            method: "DELETE",
            authToken: accessToken,
          },
        ),
      );

      queryClient.setQueryData<Post[]>(["posts"], (previous) => {
        if (!previous) {
          return previous;
        }

        return previous.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          const nextComments = post.comments.filter(
            (comment) => comment.id !== commentId,
          );

          return {
            ...post,
            comments: nextComments,
            commentsCount:
              post.commentsCount > 0
                ? post.commentsCount - 1
                : post.commentsCount,
          };
        });
      });
    },
    [queryClient, requestWithRefresh],
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
    <div className="grid h-full min-h-0 gap-6 overflow-hidden lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 overflow-y-auto">
        <FeedComponent
          createError={createPostError}
          currentUserAvatarUrl={authState.user?.profilePicture ?? null}
          currentUserDisplayName={displayName}
          currentUserHandle={userHandle}
          isCreatingPost={isCreatingPost}
          isLoading={postsQuery.isLoading}
          loadError={postsError}
          onCreatePost={handleCreatePost}
          onToggleLike={handleToggleLike}
          onCreateComment={handleCreateComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          currentUserId={authState.user?.id ?? null}
          posts={posts}
        />
      </div>
      <div className="min-h-0 overflow-y-auto">
        <PeopleYouMayKnowComponent suggestions={suggestions} />
      </div>
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
