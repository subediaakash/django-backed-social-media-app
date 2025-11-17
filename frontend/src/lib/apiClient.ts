"use client";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequestOptions<TBody = unknown> = {
    method?: HttpMethod;
    body?: TBody;
    headers?: Record<string, string>;
    authToken?: string | null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ??
    "http://127.0.0.1:8000/api";

export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(message: string, status: number, data: unknown) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

export async function apiRequest<TResponse, TBody = unknown>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
    const { method = "GET", body, headers = {}, authToken } = options;

    const requestHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...headers,
    };

    if (authToken) {
        requestHeaders.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get("Content-Type") ?? "";
    const hasJson = contentType.includes("application/json");
    const responseData = hasJson
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        throw new ApiError(
            hasJson
                ? (responseData?.detail as string) ?? "Unexpected API error"
                : "Unexpected API error",
            response.status,
            responseData,
        );
    }

    return responseData as TResponse;
}
