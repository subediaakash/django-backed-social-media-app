"use client";

import React from "react";
import { useAtom } from "jotai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Edit2, 
  Save, 
  X, 
  Trash2, 
  MessageSquare, 
  Heart,
  UsersRound,
  Loader2
} from "lucide-react";
import CardComponent from "@/pages/homepage/CardComponent";
import { authAtom } from "@/atom/authAtom";
import { useAuthedRequest } from "@/hooks/useAuthedRequest";
import { apiRequest } from "@/lib/apiClient";
import type { Post } from "@/types/posts";
import type { Group } from "@/types/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserProfile = {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  profilePicture: string | null;
};

export default function ProfilePage() {
  const [authState, setAuthState] = useAtom(authAtom);
  const { requestWithRefresh } = useAuthedRequest();
  const queryClient = useQueryClient();
  const user = authState.user;

  const [isEditingUsername, setIsEditingUsername] = React.useState(false);
  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [editUsername, setEditUsername] = React.useState(user?.username ?? "");
  const [editBio, setEditBio] = React.useState(user?.bio ?? "");
  const [activeTab, setActiveTab] = React.useState<"posts" | "groups" | "groupPosts">("posts");
  const [selectedGroupId, setSelectedGroupId] = React.useState<number | null>(null);

  // Fetch user's posts
  const postsQuery = useQuery({
    queryKey: ["user-posts", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () =>
      requestWithRefresh((accessToken) =>
        apiRequest<Post[]>("/posts/", { authToken: accessToken })
      ),
  });

  // Fetch user's groups
  const groupsQuery = useQuery({
    queryKey: ["user-groups"],
    enabled: Boolean(user?.id),
    queryFn: () =>
      requestWithRefresh((accessToken) =>
        apiRequest<Group[]>("/groups/", { authToken: accessToken })
      ),
  });

  // Fetch group posts for selected group
  const groupPostsQuery = useQuery({
    queryKey: ["group-posts", selectedGroupId],
    enabled: Boolean(selectedGroupId),
    queryFn: () =>
      requestWithRefresh((accessToken) =>
        apiRequest<Post[]>(`/groups/${selectedGroupId}/posts/`, { 
          authToken: accessToken 
        })
      ),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) =>
      requestWithRefresh((accessToken) =>
        apiRequest<UserProfile>("/users/me/", {
          method: "PATCH",
          body: data,
          authToken: accessToken,
        })
      ),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user-profile"], updatedUser);
      // Update auth atom with new user data
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));
      setIsEditingUsername(false);
      setIsEditingBio(false);
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId: number) =>
      requestWithRefresh((accessToken) =>
        apiRequest(`/posts/${postId}/`, {
          method: "DELETE",
          authToken: accessToken,
        })
      ),
    onSuccess: (_, postId) => {
      queryClient.setQueryData<Post[]>(["user-posts", user?.id], (previous) =>
        previous ? previous.filter((post) => post.id !== postId) : []
      );
      // Also update group posts if we're viewing group posts
      if (selectedGroupId) {
        queryClient.setQueryData<Post[]>(["group-posts", selectedGroupId], (previous) =>
          previous ? previous.filter((post) => post.id !== postId) : []
        );
      }
    },
  });

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

  const handleSaveUsername = async () => {
    if (editUsername.trim() && editUsername !== user?.username) {
      await updateProfileMutation.mutateAsync({ username: editUsername.trim() });
    } else {
      setIsEditingUsername(false);
    }
  };

  const handleSaveBio = async () => {
    if (editBio !== user?.bio) {
      await updateProfileMutation.mutateAsync({ bio: editBio });
    } else {
      setIsEditingBio(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePostMutation.mutateAsync(postId);
    }
  };

  const userPosts = postsQuery.data?.filter((post) => post.author.id === user?.id) ?? [];
  const userGroups = groupsQuery.data?.filter((group) => group.isMember) ?? [];
  const selectedGroup = userGroups.find((g) => g.id === selectedGroupId);
  const userGroupPosts = groupPostsQuery.data?.filter((post) => post.author.id === user?.id) ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {/* Profile Header */}
      <CardComponent className="flex flex-col gap-6 p-6">
        <header className="flex flex-wrap items-center gap-4">
          {user?.profilePicture ? (
            <img
              alt={displayName}
              className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-md shadow-rose-200/60"
              src={user.profilePicture}
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-2xl font-semibold uppercase text-white shadow-md shadow-rose-200/60">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-neutral-900">
              {displayName}
            </h1>
            {isEditingUsername ? (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  className="max-w-xs"
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Username"
                  value={editUsername}
                />
                <Button
                  className="h-8 w-8 p-0"
                  onClick={handleSaveUsername}
                  size="sm"
                  variant="outline"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setEditUsername(user?.username ?? "");
                    setIsEditingUsername(false);
                  }}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-neutral-500">
                  @{user?.username ?? "guest"}
                </p>
                <button
                  className="text-neutral-400 hover:text-[#bc1888]"
                  onClick={() => setIsEditingUsername(true)}
                  type="button"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="space-y-4 text-sm text-neutral-600">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Email
            </p>
            <p>{user?.email ?? "Not provided"}</p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Bio
              </p>
              {!isEditingBio && (
                <button
                  className="text-neutral-400 hover:text-[#bc1888]"
                  onClick={() => {
                    setEditBio(user?.bio ?? "");
                    setIsEditingBio(true);
                  }}
                  type="button"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
            {isEditingBio ? (
              <div className="mt-2 space-y-2">
                <textarea
                  className="w-full rounded-lg border border-neutral-200 p-3 text-sm focus:border-[#bc1888] focus:outline-none focus:ring-1 focus:ring-[#bc1888]"
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  value={editBio}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveBio} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditBio(user?.bio ?? "");
                      setIsEditingBio(false);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1">
                {user?.bio ?? "Add a short introduction to share your story."}
              </p>
            )}
          </div>
        </section>
      </CardComponent>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 px-2">
        <button
          className={`px-4 py-2 text-sm font-semibold transition ${
            activeTab === "posts"
              ? "border-b-2 border-[#bc1888] text-[#bc1888]"
              : "text-neutral-500 hover:text-[#bc1888]"
          }`}
          onClick={() => {
            setActiveTab("posts");
            setSelectedGroupId(null);
          }}
          type="button"
        >
          My Posts ({userPosts.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold transition ${
            activeTab === "groups"
              ? "border-b-2 border-[#bc1888] text-[#bc1888]"
              : "text-neutral-500 hover:text-[#bc1888]"
          }`}
          onClick={() => {
            setActiveTab("groups");
            setSelectedGroupId(null);
          }}
          type="button"
        >
          My Groups ({userGroups.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold transition ${
            activeTab === "groupPosts"
              ? "border-b-2 border-[#bc1888] text-[#bc1888]"
              : "text-neutral-500 hover:text-[#bc1888]"
          }`}
          onClick={() => setActiveTab("groupPosts")}
          type="button"
        >
          Group Posts
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {activeTab === "posts" && (
          <>
            {postsQuery.isLoading ? (
              <CardComponent className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#bc1888]" />
              </CardComponent>
            ) : userPosts.length === 0 ? (
              <CardComponent className="p-8 text-center text-neutral-500">
                <p>You haven't created any posts yet.</p>
              </CardComponent>
            ) : (
              userPosts.map((post) => (
                <CardComponent key={post.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-3 flex items-start gap-3">
                        {post.author.profilePicture ? (
                          <img
                            alt={post.author.username}
                            className="h-10 w-10 rounded-full object-cover"
                            src={post.author.profilePicture}
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-sm font-semibold uppercase text-white">
                            {post.author.username[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {post.author.firstName || post.author.lastName
                              ? `${post.author.firstName ?? ""} ${post.author.lastName ?? ""}`.trim()
                              : post.author.username}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-neutral-700">{post.content}</p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.commentsCount}
                        </span>
                      </div>
                    </div>
                    <button
                      className="text-red-400 hover:text-red-600"
                      onClick={() => handleDeletePost(post.id)}
                      type="button"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </CardComponent>
              ))
            )}
          </>
        )}

        {activeTab === "groups" && (
          <>
            {groupsQuery.isLoading ? (
              <CardComponent className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#bc1888]" />
              </CardComponent>
            ) : userGroups.length === 0 ? (
              <CardComponent className="p-8 text-center text-neutral-500">
                <p>You haven't joined any groups yet.</p>
              </CardComponent>
            ) : (
              userGroups.map((group) => (
                <CardComponent key={group.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <UsersRound className="h-5 w-5 text-[#bc1888]" />
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {group.name}
                        </h3>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {group.description}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                        <span>{group.membersCount} members</span>
                        <span>
                          Owner: {group.owner.username}
                        </span>
                        {group.isOwner && (
                          <span className="rounded-full bg-[#ffe6f2] px-2 py-1 text-[#bc1888]">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardComponent>
              ))
            )}
          </>
        )}

        {activeTab === "groupPosts" && (
          <>
            {userGroups.length === 0 ? (
              <CardComponent className="p-8 text-center text-neutral-500">
                <p>You haven't joined any groups yet.</p>
              </CardComponent>
            ) : !selectedGroupId ? (
              <CardComponent className="p-6">
                <p className="mb-4 text-sm font-semibold text-neutral-700">
                  Select a group to view your posts:
                </p>
                <div className="space-y-2">
                  {userGroups.map((group) => (
                    <button
                      className="w-full rounded-lg border border-neutral-200 p-4 text-left transition hover:border-[#bc1888] hover:bg-[#fff0f5]"
                      key={group.id}
                      onClick={() => {
                        setSelectedGroupId(group.id);
                      }}
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <UsersRound className="h-5 w-5 text-[#bc1888]" />
                        <span className="font-semibold text-neutral-900">
                          {group.name}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {group.membersCount} members
                      </p>
                    </button>
                  ))}
                </div>
              </CardComponent>
            ) : (
              <>
                <CardComponent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UsersRound className="h-5 w-5 text-[#bc1888]" />
                      <h3 className="font-semibold text-neutral-900">
                        {selectedGroup?.name}
                      </h3>
                    </div>
                    <Button
                      onClick={() => setSelectedGroupId(null)}
                      size="sm"
                      variant="outline"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </div>
                </CardComponent>

                {groupPostsQuery.isLoading ? (
                  <CardComponent className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#bc1888]" />
                  </CardComponent>
                ) : userGroupPosts.length === 0 ? (
                  <CardComponent className="p-8 text-center text-neutral-500">
                    <p>You haven't created any posts in this group yet.</p>
                  </CardComponent>
                ) : (
                  userGroupPosts.map((post) => (
                    <CardComponent key={post.id} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-3 flex items-start gap-3">
                            {post.author.profilePicture ? (
                              <img
                                alt={post.author.username}
                                className="h-10 w-10 rounded-full object-cover"
                                src={post.author.profilePicture}
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-sm font-semibold uppercase text-white">
                                {post.author.username[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-neutral-900">
                                {post.author.firstName || post.author.lastName
                                  ? `${post.author.firstName ?? ""} ${post.author.lastName ?? ""}`.trim()
                                  : post.author.username}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-neutral-700">{post.content}</p>
                          <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likesCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {post.commentsCount}
                            </span>
                          </div>
                        </div>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={() => handleDeletePost(post.id)}
                          type="button"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </CardComponent>
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
