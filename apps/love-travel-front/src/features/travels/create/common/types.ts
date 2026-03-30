export type TravelStatus = 'Planejado' | 'Em andamento' | 'Concluído';

export type CreateTravelPayload = {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    total_spent: number;
    status: TravelStatus;
    photos: string[];
    description: string;
}