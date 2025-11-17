"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CardComponent from "@/pages/homepage/CardComponent";
import GroupFeedComponent from "@/pages/groups/GroupFeedComponent";
import { apiRequest } from "@/lib/apiClient";
import { useAuthedRequest } from "@/hooks/useAuthedRequest";
import type { Group } from "@/types/groups";
import type { Post, PostComment } from "@/types/posts";

export default function GroupsPage() {
  const { authState, isAuthenticated, requestWithRefresh } = useAuthedRequest();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<"explore" | "my-groups" | "create">("explore");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedGroup, setSelectedGroup] = React.useState<Group | null>(null);
  const [createGroupForm, setCreateGroupForm] = React.useState({
    name: "",
    description: "",
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const groupsQuery = useQuery({
    queryKey: ["groups", searchQuery],
    enabled: isAuthenticated,
    queryFn: () =>
      requestWithRefresh((accessToken) =>
        apiRequest<Group[]>(`/groups/?${searchQuery ? `search=${encodeURIComponent(searchQuery)}` : ""}`, {
          authToken: accessToken,
        }),
      ),
  });

  const myGroupsQuery = useQuery({
    queryKey: ["my-groups"],
    enabled: isAuthenticated,
    queryFn: () =>
      requestWithRefresh((accessToken) =>
        apiRequest<Group[]>("/groups/", { authToken: accessToken }).then((groups) =>
          groups.filter((group) => group.isMember),
        ),
      ),
  });

  const groupPostsQuery = useQuery({
    queryKey: ["group-posts", selectedGroup?.id],
    enabled: isAuthenticated && selectedGroup !== null && selectedGroup.isMember,
    queryFn: () =>
      requestWithRefresh((accessToken) =>
        apiRequest<Post[]>(`/groups/${selectedGroup!.id}/posts/`, { authToken: accessToken }),
      ),
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      requestWithRefresh((accessToken) =>
        apiRequest<Group>("/groups/", {
          method: "POST",
          body: data,
          authToken: accessToken,
        }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      setActiveTab("my-groups");
      setCreateGroupForm({ name: "", description: "" });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: (groupId: number) =>
      requestWithRefresh((accessToken) =>
        apiRequest(`/groups/${groupId}/join/`, {
          method: "POST",
          authToken: accessToken,
        }),
      ),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      // Update the selected group if it's the one we just joined
      if (selectedGroup?.id === groupId) {
        setSelectedGroup((prev) => prev ? { ...prev, isMember: true } : null);
      }
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) =>
      requestWithRefresh((accessToken) =>
        apiRequest(`/groups/${groupId}/leave/`, {
          method: "POST",
          authToken: accessToken,
        }),
      ),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      // Update the selected group if it's the one we just left
      if (selectedGroup?.id === groupId) {
        setSelectedGroup((prev) => prev ? { ...prev, isMember: false } : null);
      }
    },
  });

  const createPostMutation = useMutation({
    mutationFn: ({ groupId, content }: { groupId: number; content: string }) =>
      requestWithRefresh((accessToken) =>
        apiRequest<Post>(`/groups/${groupId}/posts/`, {
          method: "POST",
          body: { content },
          authToken: accessToken,
        }),
      ),
    onSuccess: (newPost, { groupId }) => {
      queryClient.setQueryData<Post[]>(["group-posts", groupId], (previous) =>
        previous ? [newPost, ...previous] : [newPost],
      );
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: number) =>
      requestWithRefresh((accessToken) =>
        apiRequest<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like/`, {
          method: "POST",
          authToken: accessToken,
        }),
      ),
    onSuccess: (data: { liked: boolean; likesCount: number }, postId) => {
      if (selectedGroup) {
        queryClient.setQueryData<Post[]>(["group-posts", selectedGroup.id], (previous) =>
          previous
            ? previous.map((post) =>
                post.id === postId
                  ? { ...post, viewerHasLiked: data.liked, likesCount: data.likesCount }
                  : post,
              )
            : previous,
        );
      }
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      requestWithRefresh((accessToken) =>
        apiRequest<PostComment>(`/posts/${postId}/comments/`, {
          method: "POST",
          body: { content },
          authToken: accessToken,
        }),
      ),
    onSuccess: (newComment, { postId }) => {
      if (selectedGroup) {
        queryClient.setQueryData<Post[]>(["group-posts", selectedGroup.id], (previous) =>
          previous
            ? previous.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      comments: [...post.comments, newComment],
                      commentsCount: post.commentsCount + 1,
                    }
                  : post,
              )
            : previous,
        );
      }
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ postId, commentId, content }: { postId: number; commentId: number; content: string }) =>
      requestWithRefresh((accessToken) =>
        apiRequest<PostComment>(`/posts/${postId}/comments/${commentId}/`, {
          method: "PATCH",
          body: { content },
          authToken: accessToken,
        }),
      ),
    onSuccess: (updatedComment, { postId, commentId }) => {
      if (selectedGroup) {
        queryClient.setQueryData<Post[]>(["group-posts", selectedGroup.id], (previous) =>
          previous
            ? previous.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      comments: post.comments.map((comment) =>
                        comment.id === commentId ? updatedComment : comment,
                      ),
                    }
                  : post,
              )
            : previous,
        );
      }
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ postId, commentId }: { postId: number; commentId: number }) =>
      requestWithRefresh((accessToken) =>
        apiRequest(`/posts/${postId}/comments/${commentId}/`, {
          method: "DELETE",
          authToken: accessToken,
        }),
      ),
    onSuccess: (_, { postId, commentId }) => {
      if (selectedGroup) {
        queryClient.setQueryData<Post[]>(["group-posts", selectedGroup.id], (previous) =>
          previous
            ? previous.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      comments: post.comments.filter((comment) => comment.id !== commentId),
                      commentsCount: Math.max(0, post.commentsCount - 1),
                    }
                  : post,
              )
            : previous,
        );
      }
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  const displayName =
    authState.user?.firstName || authState.user?.lastName
      ? `${authState.user?.firstName ?? ""} ${authState.user?.lastName ?? ""}`.trim()
      : authState.user?.username ?? "Guest";

  const userHandle = `@${authState.user?.username ?? "guest"}`;

  return (
    <div className="grid h-full min-h-0 gap-6 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-h-0 overflow-y-auto">
        <CardComponent className="flex flex-col gap-6 p-6">
          <header className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Groups</h1>
              <p className="text-sm text-neutral-500">
                Discover collaborative spaces curated for your interests. Create a new group or explore existing communities.
              </p>
            </div>

            <div className="flex gap-2 border-b border-neutral-200">
              {[
                { id: "explore", label: "Explore" },
                { id: "my-groups", label: "My Groups" },
                { id: "create", label: "Create Group" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setSelectedGroup(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "border-b-2 border-[#bc1888] text-[#bc1888]"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {activeTab === "explore" && (
            <ExploreTab
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              groups={groupsQuery.data ?? []}
              isLoading={groupsQuery.isLoading}
              loadError={groupsQuery.error ? "Failed to load groups" : null}
              onJoinGroup={(groupId) => joinGroupMutation.mutate(groupId)}
              onLeaveGroup={(groupId) => leaveGroupMutation.mutate(groupId)}
              onSelectGroup={setSelectedGroup}
              selectedGroupId={selectedGroup?.id ?? null}
              isJoining={joinGroupMutation.isPending}
              isLeaving={leaveGroupMutation.isPending}
            />
          )}

          {activeTab === "my-groups" && (
            <MyGroupsTab
              groups={myGroupsQuery.data ?? []}
              isLoading={myGroupsQuery.isLoading}
              loadError={myGroupsQuery.error ? "Failed to load your groups" : null}
              onLeaveGroup={(groupId) => leaveGroupMutation.mutate(groupId)}
              onSelectGroup={setSelectedGroup}
              selectedGroupId={selectedGroup?.id ?? null}
              isLeaving={leaveGroupMutation.isPending}
            />
          )}

          {activeTab === "create" && (
            <CreateGroupTab
              form={createGroupForm}
              onFormChange={setCreateGroupForm}
              onSubmit={() => createGroupMutation.mutate(createGroupForm)}
              isCreating={createGroupMutation.isPending}
              error={createGroupMutation.error ? "Failed to create group" : null}
            />
          )}
        </CardComponent>
      </div>

      <div className="min-h-0 overflow-y-auto">
        {selectedGroup ? (
          <GroupFeedComponent
            group={selectedGroup}
            posts={groupPostsQuery.data ?? []}
            isLoading={groupPostsQuery.isLoading}
            loadError={groupPostsQuery.error ? "Failed to load posts" : null}
            currentUserId={authState.user?.id ?? null}
            currentUserDisplayName={displayName}
            currentUserHandle={userHandle}
            currentUserAvatarUrl={authState.user?.profilePicture ?? null}
            onCreatePost={async (content) => {
              await createPostMutation.mutateAsync({ groupId: selectedGroup.id, content });
            }}
            isCreatingPost={createPostMutation.isPending}
            createError={createPostMutation.error ? "Failed to create post" : null}
            onToggleLike={async (postId) => {
              await toggleLikeMutation.mutateAsync(postId);
            }}
            onCreateComment={async (postId, content) => {
              return await createCommentMutation.mutateAsync({ postId, content });
            }}
            onUpdateComment={async (postId, commentId, content) => {
              return await updateCommentMutation.mutateAsync({ postId, commentId, content });
            }}
            onDeleteComment={async (postId, commentId) => {
              await deleteCommentMutation.mutateAsync({ postId, commentId });
            }}
          />
        ) : (
          <CardComponent className="flex h-full items-center justify-center p-10">
            <div className="text-center text-sm text-neutral-500">
              Select a group to view its feed and posts.
            </div>
          </CardComponent>
        )}
      </div>
    </div>
  );
}

type ExploreTabProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groups: Group[];
  isLoading: boolean;
  loadError: string | null;
  onJoinGroup: (groupId: number) => void;
  onLeaveGroup: (groupId: number) => void;
  onSelectGroup: (group: Group) => void;
  selectedGroupId: number | null;
  isJoining: boolean;
  isLeaving: boolean;
};

function ExploreTab({
  searchQuery,
  onSearchChange,
  groups,
  isLoading,
  loadError,
  onJoinGroup,
  onLeaveGroup,
  onSelectGroup,
  selectedGroupId,
  isJoining,
  isLeaving,
}: ExploreTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-2xl border border-rose-100 bg-white/80 p-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-rose-100 bg-white/70 p-4">
              <div className="h-4 w-32 rounded-full bg-rose-100 mb-2" />
              <div className="h-3 w-full rounded-full bg-rose-50 mb-1" />
              <div className="h-3 w-3/4 rounded-full bg-rose-50" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="text-center text-sm text-rose-500">{loadError}</div>
      ) : groups.length === 0 ? (
        <div className="text-center text-sm text-neutral-500">
          {searchQuery ? "No groups found matching your search." : "No groups available yet."}
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={() => onJoinGroup(group.id)}
              onLeave={() => onLeaveGroup(group.id)}
              onSelect={() => onSelectGroup(group)}
              isSelected={selectedGroupId === group.id}
              isJoining={isJoining}
              isLeaving={isLeaving}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type MyGroupsTabProps = {
  groups: Group[];
  isLoading: boolean;
  loadError: string | null;
  onLeaveGroup: (groupId: number) => void;
  onSelectGroup: (group: Group) => void;
  selectedGroupId: number | null;
  isLeaving: boolean;
};

function MyGroupsTab({
  groups,
  isLoading,
  loadError,
  onLeaveGroup,
  onSelectGroup,
  selectedGroupId,
  isLeaving,
}: MyGroupsTabProps) {
  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-rose-100 bg-white/70 p-4">
              <div className="h-4 w-32 rounded-full bg-rose-100 mb-2" />
              <div className="h-3 w-full rounded-full bg-rose-50 mb-1" />
              <div className="h-3 w-3/4 rounded-full bg-rose-50" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="text-center text-sm text-rose-500">{loadError}</div>
      ) : groups.length === 0 ? (
        <div className="text-center text-sm text-neutral-500">
          You haven't joined any groups yet. Explore groups to get started!
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={() => {}} // Not used in my groups
              onLeave={() => onLeaveGroup(group.id)}
              onSelect={() => onSelectGroup(group)}
              isSelected={selectedGroupId === group.id}
              isJoining={false}
              isLeaving={isLeaving}
              showLeaveButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type CreateGroupTabProps = {
  form: { name: string; description: string };
  onFormChange: (form: { name: string; description: string }) => void;
  onSubmit: () => void;
  isCreating: boolean;
  error: string | null;
};

function CreateGroupTab({ form, onFormChange, onSubmit, isCreating, error }: CreateGroupTabProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim() && form.description.trim()) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="group-name" className="block text-sm font-medium text-neutral-700 mb-2">
          Group Name
        </label>
        <input
          id="group-name"
          type="text"
          value={form.name}
          onChange={(e) => onFormChange({ ...form, name: e.target.value })}
          className="w-full rounded-2xl border border-rose-100 bg-white/80 p-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60"
          placeholder="Enter group name..."
          required
        />
      </div>

      <div>
        <label htmlFor="group-description" className="block text-sm font-medium text-neutral-700 mb-2">
          Description
        </label>
        <textarea
          id="group-description"
          value={form.description}
          onChange={(e) => onFormChange({ ...form, description: e.target.value })}
          className="w-full resize-none rounded-2xl border border-rose-100 bg-white/80 p-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60"
          placeholder="Describe what your group is about..."
          rows={4}
          required
        />
      </div>

      {error && <div className="text-sm text-rose-500">{error}</div>}

      <button
        type="submit"
        disabled={isCreating || !form.name.trim() || !form.description.trim()}
        className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-rose-200/60 transition hover:shadow-rose-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCreating ? "Creating..." : "Create Group"}
      </button>
    </form>
  );
}

type GroupCardProps = {
  group: Group;
  onJoin: () => void;
  onLeave: () => void;
  onSelect: () => void;
  isSelected: boolean;
  isJoining: boolean;
  isLeaving: boolean;
  showLeaveButton?: boolean;
};

function GroupCard({
  group,
  onJoin,
  onLeave,
  onSelect,
  isSelected,
  isJoining,
  isLeaving,
  showLeaveButton = false,
}: GroupCardProps) {
  const ownerDisplayName = buildDisplayName(group.owner);

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer space-y-3 rounded-[32px] border p-4 shadow-inner shadow-rose-100 transition hover:shadow-lg ${
        isSelected
          ? "border-[#bc1888] bg-[#ffe6f2]/20 shadow-md shadow-[#bc1888]/20"
          : "border-rose-100 bg-white/85 hover:border-rose-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-800">{group.name}</h3>
          <p className="text-xs text-neutral-500 mt-1">
            by {ownerDisplayName} · {group.membersCount} members
          </p>
        </div>
        {group.isOwner && (
          <span className="inline-flex items-center rounded-full bg-[#ffe6f2] px-2 py-1 text-xs font-semibold text-[#bc1888]">
            Owner
          </span>
        )}
      </div>

      <p className="text-sm text-neutral-600">{group.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">
          {group.isMember ? "Member" : "Not joined"}
        </span>

        <div className="flex gap-2">
          {group.isMember ? (
            showLeaveButton && !group.isOwner && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLeave();
                }}
                disabled={isLeaving}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLeaving ? "Leaving..." : "Leave"}
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              disabled={isJoining}
              className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-rose-200/60 transition hover:shadow-rose-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isJoining ? "Joining..." : "Join"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function buildDisplayName(user?: { firstName?: string | null; lastName?: string | null; username: string }) {
  if (!user) return "Anonymous";
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name || user.username;
}


