"use client";
import React from "react";
import CardComponent from "@/pages/homepage/CardComponent";
import type { Post } from "@/types/posts";

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
          posts.map((post) => <PostCard key={post.id} post={post} />)
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

function PostCard({ post }: { post: Post }) {
  const displayName = buildAuthorName(post.author);
  const handle = `@${post.author.username}`;
  const postedAgo = formatRelativeTime(post.createdAt);

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
        <span className="inline-flex items-center rounded-full bg-[#ffe6f2] px-3 py-1 text-xs font-semibold text-[#bc1888]">
          {post.likesCount} 💜
        </span>
      </header>

      <p className="text-sm leading-relaxed text-neutral-700">{post.content}</p>

      <footer className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-500">
        <span>💬 {post.commentsCount} comments</span>
        <span className="text-[#bc1888]">Saved in Aceternity</span>
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
