import { useMutation } from "@tanstack/react-query";
import { api } from "../../../../api/client";
import { ENDPOINTS } from "../../../../api/endpoint";

type LoginRequest = { email: string; password: string };
type LoginResponse = {
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
};

export function useLogin() {
    return useMutation({
        mutationFn: async (payload: LoginRequest) => {
            const { data } = await api.post<LoginResponse>(ENDPOINTS.auth.login, payload);
            return data;
        },
    });
}