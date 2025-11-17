"use client";
import React from "react";
import CardComponent from "@/pages/homepage/CardComponent";
import type { Post, PostComment } from "@/types/posts";

type FeedComponentProps = {
  posts: Post[];
  isLoading: boolean;
  loadError: string | null;
  onCreatePost: (content: string) => Promise<void>;
  isCreatingPost: boolean;
  createError: string | null;
  currentUserDisplayName: string;
  currentUserHandle: string;
  currentUserAvatarUrl?: string | null;
  onToggleLike: (postId: number) => Promise<unknown>;
  onCreateComment: (postId: number, content: string) => Promise<PostComment>;
  onUpdateComment: (
    postId: number,
    commentId: number,
    content: string,
  ) => Promise<PostComment>;
  onDeleteComment: (postId: number, commentId: number) => Promise<void>;
  currentUserId: number | null;
};

export default function FeedComponent({
  posts,
  isLoading,
  loadError,
  onCreatePost,
  isCreatingPost,
  createError,
  currentUserDisplayName,
  currentUserHandle,
  currentUserAvatarUrl,
  onToggleLike,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  currentUserId,
}: FeedComponentProps) {
  return (
    <CardComponent className="flex flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-neutral-900">
          Discover today’s stories
        </h1>
        <p className="text-sm text-neutral-500">
          Share something uplifting and see what your friends are posting.
        </p>
      </header>

      <CreatePostCard
        createError={createError}
        currentUserDisplayName={currentUserDisplayName}
        currentUserAvatarUrl={currentUserAvatarUrl}
        currentUserHandle={currentUserHandle}
        isCreatingPost={isCreatingPost}
        onCreatePost={onCreatePost}
      />

      <section className="space-y-5">
        {isLoading ? (
          <LoadingState />
        ) : loadError ? (
          <ErrorState message={loadError} />
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleLike={onToggleLike}
              onCreateComment={onCreateComment}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              currentUserId={currentUserId}
              currentUserDisplayName={currentUserDisplayName}
              currentUserHandle={currentUserHandle}
              currentUserAvatarUrl={currentUserAvatarUrl}
            />
          ))
        )}
      </section>
    </CardComponent>
  );
}

type CreatePostCardProps = {
  onCreatePost: (content: string) => Promise<void>;
  isCreatingPost: boolean;
  createError: string | null;
  currentUserDisplayName: string;
  currentUserHandle: string;
  currentUserAvatarUrl?: string | null;
};

function CreatePostCard({
  onCreatePost,
  isCreatingPost,
  createError,
  currentUserDisplayName,
  currentUserHandle,
  currentUserAvatarUrl,
}: CreatePostCardProps) {
  const [content, setContent] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setLocalError("Your update needs a little more heart.");
      return;
    }

    setLocalError(null);

    try {
      await onCreatePost(trimmed);
      setContent("");
    } catch (error) {
      if (error instanceof Error) {
        setLocalError(error.message);
      } else {
        setLocalError("Something went wrong while sharing your post.");
      }
    }
  };

  return (
    <CardComponent className="space-y-4 border border-rose-100 bg-white/90 p-5 shadow-sm shadow-rose-100">
      <div className="flex items-start gap-3">
        <Avatar
          altText={currentUserDisplayName}
          fallbackText={currentUserDisplayName || currentUserHandle}
          imageUrl={currentUserAvatarUrl}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-800">
            {currentUserDisplayName}
          </p>
          <p className="text-xs text-neutral-400">{currentUserHandle}</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <textarea
            aria-label="Share something with your friends"
            className="min-h-[120px] w-full resize-none rounded-2xl border border-rose-100 bg-white/80 p-4 text-sm text-neutral-700 shadow-inner shadow-rose-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60"
            maxLength={5000}
            placeholder="Share a vibrant moment with your community..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={isCreatingPost}
          />
          {(localError || createError) && (
            <p className="mt-2 text-sm font-medium text-rose-500">
              {localError ?? createError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-6 text-sm font-semibold text-white shadow-md shadow-rose-200/60 transition hover:shadow-rose-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCreatingPost}
            type="submit"
          >
            {isCreatingPost ? "Sharing..." : "Share post"}
          </button>
        </div>
      </form>
    </CardComponent>
  );
}

type PostCardProps = {
  post: Post;
  onToggleLike: (postId: number) => Promise<unknown>;
  onCreateComment: (postId: number, content: string) => Promise<PostComment>;
  onUpdateComment: (
    postId: number,
    commentId: number,
    content: string,
  ) => Promise<PostComment>;
  onDeleteComment: (postId: number, commentId: number) => Promise<void>;
  currentUserId: number | null;
  currentUserDisplayName: string;
  currentUserHandle: string;
  currentUserAvatarUrl?: string | null;
};

function PostCard({
  post,
  onToggleLike,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  currentUserId,
  currentUserDisplayName,
  currentUserHandle,
  currentUserAvatarUrl,
}: PostCardProps) {
  const displayName = buildAuthorName(post.author);
  const handle = `@${post.author.username}`;
  const postedAgo = formatRelativeTime(post.createdAt);
  const commentLabel = post.commentsCount === 1 ? "comment" : "comments";

  const [areCommentsVisible, setAreCommentsVisible] = React.useState(false);
  const [isLiking, setIsLiking] = React.useState(false);
  const [likeError, setLikeError] = React.useState<string | null>(null);

  const [commentContent, setCommentContent] = React.useState("");
  const [commentError, setCommentError] = React.useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

  const [editingCommentId, setEditingCommentId] = React.useState<number | null>(null);
  const [editingContent, setEditingContent] = React.useState("");
  const [editingError, setEditingError] = React.useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  const [commentActionError, setCommentActionError] = React.useState<string | null>(null);
  const [commentBeingDeleted, setCommentBeingDeleted] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!areCommentsVisible) {
      setEditingCommentId(null);
      setEditingContent("");
      setEditingError(null);
      setCommentError(null);
      setCommentActionError(null);
      setCommentBeingDeleted(null);
      setIsSavingEdit(false);
    }
  }, [areCommentsVisible]);

  const handleToggleLikeClick = async () => {
    if (isLiking) {
      return;
    }

    setIsLiking(true);
    setLikeError(null);

    try {
      await onToggleLike(post.id);
    } catch (error) {
      setLikeError(
        getErrorMessage(
          error,
          "We couldn't update your like right now. Please try again.",
        ),
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = commentContent.trim();
    if (!trimmed) {
      setCommentError("Your comment could use a few more words.");
      return;
    }

    setCommentError(null);
    setCommentActionError(null);
    setIsSubmittingComment(true);

    try {
      await onCreateComment(post.id, trimmed);
      setCommentContent("");
    } catch (error) {
      setCommentActionError(
        getErrorMessage(
          error,
          "We couldn't share your comment. Please try again.",
        ),
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const startEditingComment = (comment: PostComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setEditingError(null);
    setCommentActionError(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
    setEditingError(null);
  };

  const handleSaveEdit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (editingCommentId === null) {
      return;
    }

    const trimmed = editingContent.trim();
    if (!trimmed) {
      setEditingError("Your comment cannot be empty.");
      return;
    }

    setEditingError(null);
    setCommentActionError(null);
    setIsSavingEdit(true);

    try {
      await onUpdateComment(post.id, editingCommentId, trimmed);
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      setCommentActionError(
        getErrorMessage(
          error,
          "We couldn't update this comment. Please try again.",
        ),
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    setCommentActionError(null);
    setCommentBeingDeleted(commentId);

    try {
      await onDeleteComment(post.id, commentId);
      if (editingCommentId === commentId) {
        handleCancelEdit();
      }
    } catch (error) {
      setCommentActionError(
        getErrorMessage(
          error,
          "We couldn't delete this comment. Please try again.",
        ),
      );
    } finally {
      setCommentBeingDeleted(null);
    }
  };

  return (
    <article className="space-y-5 rounded-[28px] border border-rose-100 bg-white/95 p-6 shadow-sm shadow-rose-100 transition hover:shadow-lg hover:shadow-rose-200/60">
      <header className="flex items-start gap-3">
        <Avatar
          altText={displayName}
          fallbackText={displayName || handle}
          imageUrl={post.author.profilePicture}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-800">{displayName}</p>
          <p className="text-xs text-neutral-400">
            {handle} · {postedAgo}
          </p>
        </div>
      </header>

      <p className="text-sm leading-relaxed text-neutral-700">{post.content}</p>

      <footer className="space-y-5">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-500">
          <button
            type="button"
            onClick={handleToggleLikeClick}
            disabled={isLiking}
            aria-pressed={post.viewerHasLiked}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60 ${
              post.viewerHasLiked
                ? "bg-[#ffe6f2] text-[#bc1888]"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <span aria-hidden>{post.viewerHasLiked ? "💜" : "🤍"}</span>
            <span>{post.likesCount}</span>
            <span>{post.viewerHasLiked ? "Liked" : "Like"}</span>
          </button>
          <span>
            💬 {post.commentsCount} {commentLabel}
          </span>
          <button
            type="button"
            onClick={() => setAreCommentsVisible((previous) => !previous)}
            aria-expanded={areCommentsVisible}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60"
          >
            {areCommentsVisible
              ? "Hide comments"
              : post.commentsCount > 0
                ? "View comments"
                : "Add a comment"}
          </button>
        </div>

        {likeError && (
          <p className="text-xs font-medium text-rose-500">{likeError}</p>
        )}

        {areCommentsVisible && commentActionError && (
          <p className="text-xs font-medium text-rose-500">{commentActionError}</p>
        )}

        {areCommentsVisible && (
          <>
            <section className="space-y-3">
              {post.comments.length > 0 ? (
                <ul className="space-y-3">
                  {post.comments.map((comment) => {
                    const authorDisplayName = buildAuthorName(comment.author);
                    const authorHandle = `@${comment.author.username}`;
                    const createdAgo = formatRelativeTime(comment.createdAt);
                    const isEdited = comment.updatedAt !== comment.createdAt;
                    const canEdit =
                      currentUserId !== null && comment.author.id === currentUserId;
                    const isEditing = editingCommentId === comment.id;

                    return (
                      <li
                        key={comment.id}
                        className="rounded-3xl border border-rose-50 bg-white/80 px-4 py-3 shadow-sm shadow-rose-100/40"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            altText={authorDisplayName}
                            fallbackText={authorDisplayName || authorHandle}
                            imageUrl={comment.author.profilePicture}
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-neutral-800">
                                {authorDisplayName}
                              </span>
                              <span className="text-xs text-neutral-400">
                                {authorHandle}
                              </span>
                              <span className="text-xs text-neutral-400">
                                · {createdAgo}
                              </span>
                              {isEdited && (
                                <span className="text-xs text-neutral-400">· Edited</span>
                              )}
                            </div>

                            {isEditing ? (
                              <form className="space-y-2" onSubmit={handleSaveEdit}>
                                <textarea
                                  className="w-full resize-none rounded-2xl border border-rose-100 bg-white/80 p-3 text-sm text-neutral-700 shadow-inner shadow-rose-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60"
                                  maxLength={1000}
                                  rows={3}
                                  value={editingContent}
                                  onChange={(event) =>
                                    setEditingContent(event.target.value)
                                  }
                                  disabled={isSavingEdit}
                                />
                                {editingError && (
                                  <p className="text-xs font-medium text-rose-500">
                                    {editingError}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="submit"
                                    disabled={isSavingEdit}
                                    className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-200/60 transition hover:shadow-rose-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isSavingEdit ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={isSavingEdit}
                                    className="inline-flex items-center justify-center rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <p className="text-sm leading-relaxed text-neutral-700">
                                {comment.content}
                              </p>
                            )}

                            {canEdit && !isEditing && (
                              <div className="flex gap-3 text-xs font-semibold text-neutral-400">
                                <button
                                  type="button"
                                  onClick={() => startEditingComment(comment)}
                                  className="transition hover:text-[#bc1888] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  disabled={commentBeingDeleted === comment.id}
                                  className="transition hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {commentBeingDeleted === comment.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-neutral-400">
                  Be the first to leave a kind word.
                </p>
              )}
            </section>

            <form className="space-y-3" onSubmit={handleCommentSubmit}>
              <div className="flex items-start gap-3">
                <Avatar
                  altText={currentUserDisplayName}
                  fallbackText={currentUserDisplayName || currentUserHandle}
                  imageUrl={currentUserAvatarUrl}
                />
                <div className="flex-1 space-y-2">
                  <textarea
                    aria-label="Share your thoughts"
                    className="w-full resize-none rounded-2xl border border-rose-100 bg-white/80 p-3 text-sm text-neutral-700 shadow-inner shadow-rose-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60"
                    placeholder="Add a kind note..."
                    maxLength={1000}
                    rows={3}
                    value={commentContent}
                    onChange={(event) => setCommentContent(event.target.value)}
                    disabled={isSubmittingComment || currentUserId === null}
                  />
                  {commentError && (
                    <p className="text-xs font-medium text-rose-500">{commentError}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingComment || currentUserId === null}
                  className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-200/60 transition hover:shadow-rose-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingComment ? "Posting..." : "Comment"}
                </button>
              </div>
            </form>
          </>
        )}

      </footer>
    </article>
  );
}


function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2].map((item) => (
        <div
          className="animate-pulse space-y-4 rounded-[28px] border border-rose-100 bg-white/70 p-6"
          key={item}
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-rose-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded-full bg-rose-100" />
              <div className="h-3 w-20 rounded-full bg-rose-50" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-rose-50" />
            <div className="h-3 w-4/5 rounded-full bg-rose-50" />
            <div className="h-3 w-2/3 rounded-full bg-rose-50" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <CardComponent className="border border-rose-100 bg-white/80 p-5 text-sm text-rose-500 shadow-inner">
      {message}
    </CardComponent>
  );
}

function EmptyState() {
  return (
    <CardComponent className="border border-dashed border-rose-200 bg-white/70 p-10 text-center text-sm text-neutral-500 shadow-inner">
      Be the first to spark today’s conversation.
    </CardComponent>
  );
}

type AvatarProps = {
  altText: string;
  fallbackText: string;
  imageUrl?: string | null;
};

function Avatar({ altText, fallbackText, imageUrl }: AvatarProps) {
  const initials = React.useMemo(() => {
    const trimmed = fallbackText.trim();
    if (!trimmed) return "A";
    const parts = trimmed.split(/\s+/).slice(0, 2);
    const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
    return letters || trimmed.slice(0, 2).toUpperCase();
  }, [fallbackText]);

  if (imageUrl) {
    return (
      <img
        alt={altText}
        className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-md shadow-rose-200/60"
        src={imageUrl}
      />
    );
  }

  return (
    <div
      aria-label={altText}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-sm font-semibold uppercase text-white shadow-md shadow-rose-200/60"
      role="img"
    >
      {initials}
    </div>
  );
}

function buildAuthorName(author: Post["author"]) {
  const name = `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim();
  return name || author.username;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const divisions = [
    { amount: 60, unit: "second" as const },
    { amount: 60, unit: "minute" as const },
    { amount: 24, unit: "hour" as const },
    { amount: 7, unit: "day" as const },
    { amount: 4.34524, unit: "week" as const },
    { amount: 12, unit: "month" as const },
    { amount: Number.POSITIVE_INFINITY, unit: "year" as const },
  ];

  let duration = (date.getTime() - Date.now()) / 1000;

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return rtf.format(Math.round(duration), "year");
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}
