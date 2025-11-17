export type GroupOwner = {
    id: number;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
};

export type Group = {
    id: number;
    name: string;
    description: string;
    owner: GroupOwner;
    membersCount: number;
    isMember: boolean;
    isOwner: boolean;
    created_at: string;
};

export type GroupMembership = {
    id: number;
    user: GroupOwner;
    role: string;
    joined_at: string;
};
