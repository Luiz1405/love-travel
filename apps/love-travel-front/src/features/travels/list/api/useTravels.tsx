import { useQuery } from '@tanstack/react-query';
import { TravelService } from '../../../../services/travel/travel-service';
import type { Travel } from '../common/types';

type UseTravelsParams = {
    page: number;
    pageSize: number;
    searchTerm?: string;
};

export function useTravels({ page, pageSize, searchTerm }: UseTravelsParams) {
    return useQuery({
        queryKey: ['travels', page, pageSize, searchTerm],
        queryFn: async () => {
            const skip = (page - 1) * pageSize;
            const normalized = searchTerm?.trim();
            const data = normalized
                ? await TravelService.search({ search: normalized, skip, limit: pageSize })
                : await TravelService.getAll({ skip, limit: pageSize });
            return data as Travel[];
        },
    });
}
