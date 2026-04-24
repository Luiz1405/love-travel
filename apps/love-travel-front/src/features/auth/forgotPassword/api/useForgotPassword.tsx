import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../../../../services/auth/auth-service";

type ForgotPasswordRequest = {
    email: string;
    password: string;
};

export function useForgotPassword() {
    return useMutation({
        mutationFn: async (payload: ForgotPasswordRequest) => {
            return AuthService.forgotPassword(payload);
        },
    });
}