import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../../../../services/auth/auth-service";

type LoginRequest = { email: string; password: string };

export function useLogin() {
    return useMutation({
        mutationFn: async (payload: LoginRequest) => {
            return AuthService.login(payload);
        },
    });
}