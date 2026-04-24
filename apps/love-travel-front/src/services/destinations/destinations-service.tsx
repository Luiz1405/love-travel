import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoint";
import type { FeaturedDestination } from "../../api/types";

export const DestinationsService = {
    async getFeatured() {
        const response = await api.get<FeaturedDestination[]>(ENDPOINTS.destinations.featured);
        return response.data;
    },
};
