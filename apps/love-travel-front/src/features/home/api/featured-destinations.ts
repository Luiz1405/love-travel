import { useQuery } from '@tanstack/react-query';
import type { FeaturedDestination } from '../../../api/types';
import { DestinationsService } from '../../../services/destinations/destinations-service';

export function useFeaturedDestinations() {
    return useQuery({
        queryKey: ['featured-destinations'],
        queryFn: async (): Promise<FeaturedDestination[]> => {
            return DestinationsService.getFeatured();
        },
        staleTime: 1000 * 60 * 5,
    });
}