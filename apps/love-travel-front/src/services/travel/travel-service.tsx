import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoint";


export const TravelService = {
    async create(data: any) {
        const response = await api.post(ENDPOINTS.travels.create, data);
        return response.data;
    },

    async remove(id: string) {
        const response = await api.delete(ENDPOINTS.travels.delete(id));
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(ENDPOINTS.travels.update(id), data);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(ENDPOINTS.travels.detail(id));
        return response.data;
    },

    async getAll() {
        const response = await api.get(ENDPOINTS.travels.listAll);
        return response.data;
    },
}