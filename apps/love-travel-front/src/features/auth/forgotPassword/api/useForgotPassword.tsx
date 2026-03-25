import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "../../../../api/endpoint";
import { api } from "../../../../api/client";


type ForgotPasswordRequest = {
    email: string;
    password: string;
};

export function useForgotPassword() {
    return useMutation({
        mutationFn: async (payload: ForgotPasswordRequest) => {
            const { data } = await api.post(ENDPOINTS.auth.forgotPassword, payload);
            return data;
        },
    });
}