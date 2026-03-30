import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoint";


export const TravelService = {
    async create(data: unknown) {
        const response = await api.post(ENDPOINTS.travels.create, data);
        return response.data;
    },

    async remove(id: string) {
        const response = await api.delete(ENDPOINTS.travels.delete(id));
        return response.data;
    },

    async update(id: string, data: FormData | {
        title: string;
        destination: string;
        startDate: string;
        endDate: string;
        total_spent: number;
        status: string;
        description: string;
    }) {
        const response = await api.patch(ENDPOINTS.travels.update(id), data);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(ENDPOINTS.travels.detail(id));
        return response.data;
    },

    async getAll(params?: { skip?: number; limit?: number }) {
        const response = await api.get(ENDPOINTS.travels.listAll, { params });
        return response.data;
    },

    async search(params: { search: string; skip?: number; limit?: number }) {
        const response = await api.get(ENDPOINTS.travels.search, { params });
        return response.data;
    },
}