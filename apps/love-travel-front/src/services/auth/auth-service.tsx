import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoint";


export const AuthService = {
    async login(data: any) {
        const response = await api.post(ENDPOINTS.auth.login, data);
        return response.data;
    },

    async register(data: any) {
        const response = await api.post(ENDPOINTS.auth.register, data);
        return response.data;
    },
}