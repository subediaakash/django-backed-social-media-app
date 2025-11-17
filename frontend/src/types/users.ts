export type RelationshipStatus =
    | "self"
    | "friends"
    | "pending_incoming"
    | "pending_outgoing"
    | "none";

export type PeopleSearchResult = {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
    relationshipStatus: RelationshipStatus;
};
