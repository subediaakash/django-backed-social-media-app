export type PostAuthor = {
    id: number;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
};

export type PostComment = {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: PostAuthor;
};

export type Post = {
    id: number;
    content: string;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    author: PostAuthor;
    comments: PostComment[];
    viewerHasLiked: boolean;
};
