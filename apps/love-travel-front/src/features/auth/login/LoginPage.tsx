import { LoginForm } from "./components/LoginForm";
import { useLogin } from "./api/useLogin";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export function LoginPage() {
    const { mutateAsync } = useLogin();
    const navigate = useNavigate();
    const { login } = useAuth();
    const location = useLocation();
    const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;

    useEffect(() => {
        if (successMessage) {
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [successMessage, location.pathname, navigate]);

    return (
        <div className="min-h-dvh grid grid-cols-1 md:grid-cols-2">
            <div className="relative hidden md:block">
                <img
                    src="/images/praias-paradisiacas.jpg"
                    alt="Praia paradisíaca"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h2 className="text-2xl font-bold drop-shadow">Descubra novos horizontes</h2>
                    <p className="mt-2 max-w-md text-sm text-white/90">
                        Guarde memórias, planeje suas próximas aventuras e explore o mundo.
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center p-6 md:p-10 bg-white">
                <LoginForm
                    successMessage={successMessage}
                    onSubmit={async (credentials) => {
                        const res = await mutateAsync(credentials);
                        const token = res?.accessToken ?? res?.access_token;
                        login(token);
                    }}
                    onSuccess={() => navigate("/")}
                />
            </div>
        </div>
    );
}