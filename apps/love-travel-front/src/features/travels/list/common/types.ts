export type TravelStatus = 'Planejado' | 'Em andamento' | 'Concluído';

export type Travel = {
    _id?: string;
    id?: string;
    title: string;
    destination: string;
    startDate: string;
    endDate?: string;
    total_spent: number;
    status: TravelStatus;
    photos: string[];
    description?: string;
};
