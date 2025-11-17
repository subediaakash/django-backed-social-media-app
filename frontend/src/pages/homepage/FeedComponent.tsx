"use client";
import CardComponent from "@/pages/homepage/CardComponent";
import React from "react";

type FeedCard = {
  author: string;
  time: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
};

type FeedComponentProps = {
  posts: FeedCard[];
  onCreatePost?: () => void;
};

export default function FeedComponent({
  posts,
  onCreatePost,
}: FeedComponentProps) {
  return (
    <CardComponent className="flex flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Discover today’s stories
          </h1>
          <p className="text-sm text-neutral-500">
            See what your friends are posting right now.
          </p>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center rounded-xl bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-5 text-sm font-semibold text-white shadow-md shadow-rose-200/60 transition hover:shadow-rose-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60"
          onClick={onCreatePost}
          type="button"
        >
          Create post
        </button>
      </header>

      <div className="space-y-5">
        {posts.map((post) => (
          <article
            className="overflow-hidden rounded-[28px] border border-rose-100 bg-white/95 shadow-sm shadow-rose-100 transition hover:shadow-lg hover:shadow-rose-200/60"
            key={`${post.author}-${post.time}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-4 pt-6">
              <div>
                <p className="text-sm font-semibold text-neutral-800">
                  {post.author}
                </p>
                <p className="text-xs text-neutral-400">{post.time}</p>
              </div>
              <button className="rounded-full bg-[#ffe6f2] px-4 py-2 text-xs font-medium text-[#bc1888] transition hover:bg-[#f9a8d4]/30">
                Follow
              </button>
            </div>
            <div className="space-y-4 px-6 pb-6">
              <p className="text-sm text-neutral-600">{post.caption}</p>
              <CardComponent className="overflow-hidden border border-rose-100">
                <img
                  alt={post.author}
                  className="h-64 w-full object-cover"
                  src={post.image}
                />
              </CardComponent>
              <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-neutral-500">
                <span>💜 {post.likes}</span>
                <span>💬 {post.comments} comments</span>
                <span className="ml-auto text-[#bc1888] transition hover:underline">
                  View conversation →
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </CardComponent>
  );
}

