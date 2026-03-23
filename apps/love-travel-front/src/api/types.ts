export type ApiError = {
    message: string;
    statusCode?: number;
    details?: unknown;
}

export type FeaturedDestination = {
    id: string;
    name: string;
    coverUrl: string;
    slug: string;
}