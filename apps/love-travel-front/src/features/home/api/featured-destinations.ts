import { useQuery } from '@tanstack/react-query';
import type { FeaturedDestination } from '../../../api/types';
import { api } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoint';

export function useFeaturedDestinations() {
    return useQuery({
        queryKey: ['featured-destinations'],
        queryFn: async () => {
            const { data } = await api.get<FeaturedDestination[]>(ENDPOINTS.destinations.featured);
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
}