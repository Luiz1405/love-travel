import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoint";

export const UserService = {
    async create(data: any) {
        const response = await api.post(ENDPOINTS.users.create, data);
        return response.data;
    },

    async remove(id: string) {
        const response = await api.delete(ENDPOINTS.users.delete(id));
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(ENDPOINTS.users.update(id), data);
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(ENDPOINTS.users.detail(id));
        return response.data;
    },

    async getAll() {
        const response = await api.get(ENDPOINTS.users.listAll);
        return response.data;
    },
}