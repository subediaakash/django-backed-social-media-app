import type { AuthTokens } from "../atom/authAtom";
import { apiRequest } from "./apiClient";

type TokenRefreshResponse = {
    access: string;
    refresh?: string;
};

export async function refreshTokens(
    refreshToken: string,
): Promise<AuthTokens> {
    const response = await apiRequest<
        TokenRefreshResponse,
        { refresh: string }
    >(
        "/auth/token/refresh/",
        {
            method: "POST",
            body: { refresh: refreshToken },
        },
    );

    return {
        access: response.access,
        refresh: response.refresh ?? refreshToken,
    };
}
