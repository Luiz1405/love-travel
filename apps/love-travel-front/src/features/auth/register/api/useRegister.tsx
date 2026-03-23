import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../../../../services/auth/auth-service";

type RegisterRequest = {
    name: string;
    email: string;
    password: string;
};

export function useRegister() {
    return useMutation({
        mutationFn: async (data: RegisterRequest) => {
            return AuthService.register(data);
        },
    });
}