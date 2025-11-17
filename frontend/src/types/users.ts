export type RelationshipStatus =
    | "self"
    | "friends"
    | "pending_incoming"
    | "pending_outgoing"
    | "none";

export type UserSummary = {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
};

export type PeopleSearchResult = UserSummary & {
    relationshipStatus: RelationshipStatus;
};

export type FriendRequestSummary = {
    id: number;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
    respondedAt: string | null;
    sender: UserSummary;
    receiver: UserSummary;
};
