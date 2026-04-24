import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

import type { CreateTravelPayload } from '../common/types';
import { TravelService } from '../../../../services/travel/travel-service';

export function useCreateTravel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { payload: CreateTravelPayload; photos: File[] }) => {
            const { payload, photos } = params;

            const form = new FormData();
            form.append('title', payload.title);
            form.append('destination', payload.destination);
            form.append('startDate', payload.startDate);
            form.append('endDate', payload.endDate);
            form.append('total_spent', String(payload.total_spent));
            form.append('status', payload.status);
            if (payload.description) form.append('description', payload.description);
            photos.forEach((f) => form.append('photos', f));

            return TravelService.create(form);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['travels'] });
        },
    });
}