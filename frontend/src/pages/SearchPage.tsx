"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CardComponent from "@/pages/homepage/CardComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, apiRequest } from "@/lib/apiClient";
import { useAuthedRequest } from "@/hooks/useAuthedRequest";
import type {
  PeopleSearchResult,
  RelationshipStatus,
} from "@/types/users";

const SEARCH_DEBOUNCE_MS = 300;

export default function SearchPage() {
  const { authState, isAuthenticated, requestWithRefresh } =
    useAuthedRequest();
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [inputValue]);

  const peopleQuery = useQuery({
    queryKey: ["people-search", { query: debouncedQuery }],
    enabled: isAuthenticated,
    queryFn: () =>
      requestWithRefresh((accessToken) => {
        const params = debouncedQuery
          ? `?q=${encodeURIComponent(debouncedQuery)}`
          : "";
        return apiRequest<PeopleSearchResult[]>(
          `/friends/search/${params}`,
          { authToken: accessToken },
        );
      }),
  });

  const updateSearchCaches = React.useCallback(
    (receiverId: number, status: RelationshipStatus) => {
      const matchingQueries = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["people-search"], exact: false });

      matchingQueries.forEach((query) => {
        queryClient.setQueryData<PeopleSearchResult[]>(
          query.queryKey as unknown[],
          (previous) =>
            previous
              ? previous.map((person) =>
                  person.id === receiverId
                    ? { ...person, relationshipStatus: status }
                    : person,
                )
              : previous,
        );
      });
    },
    [queryClient],
  );

  const sendFriendRequestMutation = useMutation<
    { receiverId: number },
    unknown,
    number
  >({
    mutationFn: (receiverId) =>
      requestWithRefresh((accessToken) =>
        apiRequest<{ receiverId: number }, { receiverId: number }>(
          "/friends/requests/",
          {
            method: "POST",
            body: { receiverId },
            authToken: accessToken,
          },
        ),
      ),
    onSuccess: (_data, receiverId) => {
      updateSearchCaches(receiverId, "pending_outgoing");
    },
  });

  const hasQuery = debouncedQuery.length > 0;
  const results = peopleQuery.data ?? [];
  const isInitialLoading = peopleQuery.isLoading;
  const isRefreshing = peopleQuery.isFetching && !peopleQuery.isLoading;

  const searchError = peopleQuery.error
    ? normalizeError(
        peopleQuery.error,
        hasQuery
          ? "We couldn't find people matching that search."
          : "We couldn't load suggestions right now.",
      )
    : null;

  const sendRequestError = sendFriendRequestMutation.error
    ? normalizeError(
        sendFriendRequestMutation.error,
        "We couldn't send the friend request. Please try again.",
      )
    : null;

  const pendingReceiverId =
    sendFriendRequestMutation.isPending &&
    typeof sendFriendRequestMutation.variables === "number"
      ? sendFriendRequestMutation.variables
      : null;

  const heading = hasQuery
    ? `Results for “${debouncedQuery}”`
    : "Suggested connections";

  const emptyMessage = hasQuery
    ? "No people match that search yet. Try another name or check your spelling."
    : "We’ll keep curating new people you might want to connect with.";

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <CardComponent className="space-y-5 p-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Search people
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Discover creators and collaborators across Aceternity. Start typing
            to find people by name or username.
          </p>
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => event.preventDefault()}
        >
          <Input
            autoComplete="off"
            placeholder="Search by name or @username"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <Button className="sm:w-32" type="submit">
            Search
          </Button>
        </form>

        {sendRequestError && (
          <CardComponent className="border border-rose-100 bg-white/85 p-4 text-sm font-medium text-rose-500">
            {sendRequestError}
          </CardComponent>
        )}
      </CardComponent>

      <CardComponent className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <div className="shrink-0">
          <h2 className="text-lg font-semibold text-neutral-900">{heading}</h2>
          {authState.user && (
            <p className="text-xs text-neutral-500">
              Signed in as @{authState.user.username}
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto space-y-3">
          {isInitialLoading ? (
            <LoadingState />
          ) : searchError ? (
            <ErrorState message={searchError} />
          ) : results.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : (
            results.map((person) => (
              <PersonResultCard
                key={person.id}
                person={person}
                isSending={pendingReceiverId === person.id}
                onSendFriendRequest={() =>
                  sendFriendRequestMutation.mutate(person.id)
                }
              />
            ))
          )}
        </div>

        {isRefreshing && (
          <p className="text-xs text-neutral-400">Updating suggestions…</p>
        )}
      </CardComponent>
    </div>
  );
}

type PersonResultCardProps = {
  person: PeopleSearchResult;
  isSending: boolean;
  onSendFriendRequest: () => void;
};

function PersonResultCard({
  person,
  isSending,
  onSendFriendRequest,
}: PersonResultCardProps) {
  const displayName = buildDisplayName(person);
  const action = getActionProps(person.relationshipStatus);
  const helperText = getStatusHelperText(person.relationshipStatus);

  const isActionDisabled = action.disabled || isSending;

  return (
    <CardComponent className="flex items-center justify-between gap-4 border border-rose-100 bg-white/85 p-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar displayName={displayName} imageUrl={person.profilePicture} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-800">
            {displayName}
          </p>
          <p className="text-xs text-neutral-400">@{person.username}</p>
          {helperText && (
            <p className="mt-1 text-xs text-neutral-400">{helperText}</p>
          )}
        </div>
      </div>
      <Button
        className="shrink-0"
        disabled={isActionDisabled}
        onClick={() => {
          if (action.disabled) {
            return;
          }
          onSendFriendRequest();
        }}
        variant={action.variant}
      >
        {isSending ? "Sending..." : action.label}
      </Button>
    </CardComponent>
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

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          className="flex items-center justify-between gap-4 rounded-[24px] border border-rose-100 bg-white/75 p-4"
          key={item}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-100" />
            <div className="space-y-2">
              <div className="h-3 w-36 rounded-full bg-rose-100" />
              <div className="h-3 w-24 rounded-full bg-rose-50" />
            </div>
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

function getActionProps(status: RelationshipStatus) {
  switch (status) {
    case "self":
      return { label: "You", disabled: true, variant: "outline" as const };
    case "friends":
      return { label: "Friends", disabled: true, variant: "outline" as const };
    case "pending_outgoing":
      return { label: "Pending", disabled: true, variant: "outline" as const };
    case "pending_incoming":
      return { label: "Respond", disabled: true, variant: "outline" as const };
    default:
      return { label: "Add friend", disabled: false, variant: "default" as const };
  }
}

function getStatusHelperText(status: RelationshipStatus) {
  switch (status) {
    case "friends":
      return "You’re already connected.";
    case "pending_outgoing":
      return "Friend request sent — waiting for a response.";
    case "pending_incoming":
      return "Sent you a friend request. Check requests to respond.";
    default:
      return null;
  }
}

function buildDisplayName(person: PeopleSearchResult) {
  const name = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
  return name || person.username;
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

