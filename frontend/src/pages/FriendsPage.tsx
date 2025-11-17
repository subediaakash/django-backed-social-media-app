"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CardComponent from "@/pages/homepage/CardComponent";
import { Button } from "@/components/ui/button";
import { ApiError, apiRequest } from "@/lib/apiClient";
import { useAuthedRequest } from "@/hooks/useAuthedRequest";
import type { FriendRequestSummary, UserSummary } from "@/types/users";
import { cn } from "@/lib/utils";

const FRIENDS_QUERY_KEY = ["friends", "list"];
const INCOMING_QUERY_KEY = ["friends", "requests", "incoming"];
const OUTGOING_QUERY_KEY = ["friends", "requests", "outgoing"];

type TabKey = "friends" | "incoming" | "outgoing";

type TabDefinition = {
  key: TabKey;
  label: string;
  description: string;
  count: number | null;
  isLoading: boolean;
};

export default function FriendsPage() {
  const { isAuthenticated, requestWithRefresh } = useAuthedRequest();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabKey>("friends");

  const friendsQuery = useQuery({
    queryKey: FRIENDS_QUERY_KEY,
    enabled: isAuthenticated,
    queryFn: () =>
      requestWithRefresh((accessToken) =>
        apiRequest<UserSummary[]>("/friends/", { authToken: accessToken }),
      ),
  });

  const incomingRequestsQuery = useQuery({
    queryKey: INCOMING_QUERY_KEY,
    enabled: isAuthenticated,
    queryFn: () =>
      requestWithRefresh((accessToken) =>
        apiRequest<FriendRequestSummary[]>(
          "/friends/requests/?status=pending",
          { authToken: accessToken },
        ),
      ),
  });

  const outgoingRequestsQuery = useQuery({
    queryKey: OUTGOING_QUERY_KEY,
    enabled: isAuthenticated,
    queryFn: () =>
      requestWithRefresh((accessToken) =>
        apiRequest<FriendRequestSummary[]>(
          "/friends/requests/?direction=outgoing&status=pending",
          { authToken: accessToken },
        ),
      ),
  });

  const respondMutation = useMutation<
    FriendRequestSummary,
    unknown,
    { requestId: number; action: "accept" | "reject" }
  >({
    mutationFn: ({ requestId, action }) =>
      requestWithRefresh((accessToken) =>
        apiRequest<FriendRequestSummary, { action: "accept" | "reject" }>(
          `/friends/requests/${requestId}/respond/`,
          {
            method: "POST",
            body: { action },
            authToken: accessToken,
          },
        ),
      ),
    onMutate: () => {
      setActionError(null);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<FriendRequestSummary[]>(
        INCOMING_QUERY_KEY,
        (previous) =>
          previous
            ? previous.filter((request) => request.id !== variables.requestId)
            : previous,
      );

      if (variables.action === "accept") {
        const newFriend = data.sender;
        queryClient.setQueryData<UserSummary[]>(
          FRIENDS_QUERY_KEY,
          (previous) => {
            if (!previous) {
              return [newFriend];
            }
            if (previous.some((friend) => friend.id === newFriend.id)) {
              return previous;
            }
            return [...previous, newFriend].sort((a, b) =>
              a.username.localeCompare(b.username),
            );
          },
        );
      }
    },
    onError: (error) => {
      setActionError(
        normalizeError(
          error,
          "We couldn't update that friend request. Please try again.",
        ),
      );
    },
  });

  const cancelMutation = useMutation<void, unknown, number>({
    mutationFn: (requestId) =>
      requestWithRefresh((accessToken) =>
        apiRequest<void>(`/friends/requests/${requestId}/`, {
          method: "DELETE",
          authToken: accessToken,
        }),
      ),
    onMutate: () => {
      setActionError(null);
    },
    onSuccess: (_data, requestId) => {
      queryClient.setQueryData<FriendRequestSummary[]>(
        OUTGOING_QUERY_KEY,
        (previous) =>
          previous
            ? previous.filter((request) => request.id !== requestId)
            : previous,
      );
    },
    onError: (error) => {
      setActionError(
        normalizeError(
          error,
          "We couldn't cancel that friend request. Please try again.",
        ),
      );
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  const pendingRespondId =
    respondMutation.isPending && respondMutation.variables
      ? respondMutation.variables.requestId
      : null;
  const pendingRespondAction =
    respondMutation.isPending && respondMutation.variables
      ? respondMutation.variables.action
      : null;
  const pendingCancelId =
    cancelMutation.isPending && typeof cancelMutation.variables === "number"
      ? cancelMutation.variables
      : null;

  const friends = friendsQuery.data ?? [];
  const incomingRequests = (incomingRequestsQuery.data ?? []).filter(
    (request) => request.status === "pending",
  );
  const outgoingRequests = (outgoingRequestsQuery.data ?? []).filter(
    (request) => request.status === "pending",
  );

  const friendsError = friendsQuery.error
    ? normalizeError(
        friendsQuery.error,
        "We couldn't load your friends. Please try again.",
      )
    : null;
  const incomingError = incomingRequestsQuery.error
    ? normalizeError(
        incomingRequestsQuery.error,
        "We couldn't load incoming requests. Please refresh and try again.",
      )
    : null;
  const outgoingError = outgoingRequestsQuery.error
    ? normalizeError(
        outgoingRequestsQuery.error,
        "We couldn't load your sent requests. Please refresh and try again.",
      )
    : null;

  const tabs: TabDefinition[] = [
    {
      key: "friends",
      label: "Your friends",
      description: "People you’re connected with.",
      count: friendsQuery.isLoading ? null : friends.length,
      isLoading: friendsQuery.isLoading,
    },
    {
      key: "incoming",
      label: "Incoming requests",
      description: "Respond to invitations sent to you.",
      count: incomingRequestsQuery.isLoading ? null : incomingRequests.length,
      isLoading: incomingRequestsQuery.isLoading,
    },
    {
      key: "outgoing",
      label: "Sent requests",
      description: "Track the requests you’ve sent out.",
      count: outgoingRequestsQuery.isLoading ? null : outgoingRequests.length,
      isLoading: outgoingRequestsQuery.isLoading,
    },
  ];

  const activeTabMeta = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  const renderActiveContent = () => {
    switch (activeTab) {
      case "friends":
        if (friendsQuery.isLoading) {
          return <ListSkeleton />;
        }
        if (friendsError) {
          return <ErrorState message={friendsError} />;
        }
        if (friends.length === 0) {
          return (
            <EmptyState message="Start connecting! Send requests from the search page to grow your community." />
          );
        }
        return (
          <div className="space-y-3">
            {friendsQuery.isFetching && !friendsQuery.isLoading && (
              <p className="text-xs text-neutral-400">Refreshing…</p>
            )}
            {friends.map((friend) => (
              <FriendRow key={friend.id} friend={friend} />
            ))}
          </div>
        );
      case "incoming":
        if (incomingRequestsQuery.isLoading) {
          return <ListSkeleton />;
        }
        if (incomingError) {
          return <ErrorState message={incomingError} />;
        }
        if (incomingRequests.length === 0) {
          return (
            <EmptyState message="No pending invitations right now. We’ll let you know when someone reaches out." />
          );
        }
        return (
          <div className="space-y-3">
            {incomingRequestsQuery.isFetching &&
              !incomingRequestsQuery.isLoading && (
                <p className="text-xs text-neutral-400">Refreshing…</p>
              )}
            {incomingRequests.map((request) => (
              <IncomingRequestRow
                key={request.id}
                request={request}
                isAccepting={
                  pendingRespondId === request.id &&
                  pendingRespondAction === "accept"
                }
                isDeclining={
                  pendingRespondId === request.id &&
                  pendingRespondAction === "reject"
                }
                onAccept={() =>
                  respondMutation.mutate({
                    requestId: request.id,
                    action: "accept",
                  })
                }
                onDecline={() =>
                  respondMutation.mutate({
                    requestId: request.id,
                    action: "reject",
                  })
                }
              />
            ))}
          </div>
        );
      case "outgoing":
        if (outgoingRequestsQuery.isLoading) {
          return <ListSkeleton />;
        }
        if (outgoingError) {
          return <ErrorState message={outgoingError} />;
        }
        if (outgoingRequests.length === 0) {
          return (
            <EmptyState message="No pending requests right now. Invite people you meet to keep your network growing." />
          );
        }
        return (
          <div className="space-y-3">
            {outgoingRequestsQuery.isFetching &&
              !outgoingRequestsQuery.isLoading && (
                <p className="text-xs text-neutral-400">Refreshing…</p>
              )}
            {outgoingRequests.map((request) => (
              <OutgoingRequestRow
                key={request.id}
                request={request}
                isCancelling={pendingCancelId === request.id}
                onCancel={() => cancelMutation.mutate(request.id)}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <CardComponent className="space-y-2 p-6">
        <h1 className="text-xl font-semibold text-neutral-900">
          Friends & requests
        </h1>
        <p className="text-sm text-neutral-500">
          Review your connections, respond to invites, and manage the requests
          you&apos;ve sent.
        </p>
      </CardComponent>

      <CardComponent className="flex min-h-0 flex-1 flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTabMeta.key;
            const countLabel =
              tab.count === null
                ? tab.isLoading
                  ? "…"
                  : "0"
                : String(tab.count);
            return (
              <button
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60",
                  isActive
                    ? "border-[#f9a8d4] bg-[#fff0f5] text-[#bc1888] shadow-sm shadow-rose-100"
                    : "border-transparent bg-white/80 text-neutral-600 hover:border-[#f9a8d4] hover:text-[#bc1888]",
                )}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    isActive ? "bg-white text-[#bc1888]" : "bg-[#ffe6f2] text-[#bc1888]",
                  )}
                >
                  {countLabel}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-1 flex-col space-y-3">
          <p className="text-sm text-neutral-500">{activeTabMeta.description}</p>
          {actionError && (
            <CardComponent className="border border-rose-100 bg-white/85 p-4 text-sm font-medium text-rose-500">
              {actionError}
            </CardComponent>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {renderActiveContent()}
          </div>
        </div>
      </CardComponent>
    </div>
  );
}

function FriendRow({ friend }: { friend: UserSummary }) {
  const displayName = buildDisplayName(friend);

  return (
    <div className="flex items-center justify-between gap-4 rounded-[24px] border border-rose-100 bg-white/85 p-4">
      <UserIdentity displayName={displayName} username={friend.username} imageUrl={friend.profilePicture} />
      <Button disabled variant="outline">
        Friends
      </Button>
    </div>
  );
}

type IncomingRequestRowProps = {
  request: FriendRequestSummary;
  isAccepting: boolean;
  isDeclining: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

function IncomingRequestRow({
  request,
  isAccepting,
  isDeclining,
  onAccept,
  onDecline,
}: IncomingRequestRowProps) {
  const displayName = buildDisplayName(request.sender);
  const requestedAgo = formatRelativeTime(request.createdAt);

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-rose-100 bg-white/85 p-4">
      <div className="flex items-center justify-between gap-4">
        <UserIdentity
          displayName={displayName}
          username={request.sender.username}
          imageUrl={request.sender.profilePicture}
        />
        <span className="shrink-0 text-xs font-semibold text-[#bc1888]">
          New request
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
        <span>Requested {requestedAgo}</span>
        <div className="flex gap-2">
          <Button
            className="min-w-[84px]"
            disabled={isAccepting}
            onClick={onAccept}
          >
            {isAccepting ? "Accepting..." : "Accept"}
          </Button>
          <Button
            className="min-w-[84px]"
            disabled={isDeclining}
            onClick={onDecline}
            variant="outline"
          >
            {isDeclining ? "Declining..." : "Decline"}
          </Button>
        </div>
      </div>
    </div>
  );
}

type OutgoingRequestRowProps = {
  request: FriendRequestSummary;
  isCancelling: boolean;
  onCancel: () => void;
};

function OutgoingRequestRow({
  request,
  isCancelling,
  onCancel,
}: OutgoingRequestRowProps) {
  const displayName = buildDisplayName(request.receiver);
  const requestedAgo = formatRelativeTime(request.createdAt);

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-rose-100 bg-white/85 p-4">
      <div className="flex items-center justify-between gap-4">
        <UserIdentity
          displayName={displayName}
          username={request.receiver.username}
          imageUrl={request.receiver.profilePicture}
        />
        <span className="shrink-0 text-xs font-semibold text-[#f39c6b]">
          Pending
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
        <span>Sent {requestedAgo}</span>
        <Button
          className="min-w-[110px]"
          disabled={isCancelling}
          onClick={onCancel}
          variant="outline"
        >
          {isCancelling ? "Cancelling..." : "Cancel request"}
        </Button>
      </div>
    </div>
  );
}

function UserIdentity({
  displayName,
  username,
  imageUrl,
}: {
  displayName: string;
  username: string;
  imageUrl: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar displayName={displayName} imageUrl={imageUrl} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-neutral-800">
          {displayName}
        </p>
        <p className="text-xs text-neutral-400">@{username}</p>
      </div>
    </div>
  );
}

function UserAvatar({
  displayName,
  imageUrl,
}: {
  displayName: string;
  imageUrl: string | null;
}) {
  const initials = React.useMemo(() => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      return "A";
    }
    const parts = trimmed.split(/\s+/).slice(0, 2);
    const letters = parts
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
    return letters || trimmed.slice(0, 2).toUpperCase();
  }, [displayName]);

  if (imageUrl) {
    return (
      <img
        alt={displayName}
        className="h-10 w-10 rounded-full border border-white object-cover shadow-sm shadow-rose-200/60"
        src={imageUrl}
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-xs font-semibold uppercase text-white shadow-sm shadow-rose-200/60">
      {initials}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          className="flex items-center gap-4 rounded-[24px] border border-rose-100 bg-white/75 p-4"
          key={item}
        >
          <div className="h-10 w-10 rounded-full bg-rose-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded-full bg-rose-100" />
            <div className="h-3 w-24 rounded-full bg-rose-50" />
          </div>
          <div className="h-8 w-24 rounded-xl bg-rose-100" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <CardComponent className="border border-rose-100 bg-white/85 p-4 text-sm font-medium text-rose-500">
      {message}
    </CardComponent>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <CardComponent className="border border-dashed border-rose-200 bg-white/75 p-8 text-center text-sm text-neutral-500">
      {message}
    </CardComponent>
  );
}

function buildDisplayName(person: UserSummary) {
  const name = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
  return name || person.username;
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

function normalizeError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }
  return fallbackMessage;
}


