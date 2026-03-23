import { LoginForm } from "./components/LoginForm";
import { useLogin } from "./api/useLogin";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
    const { mutateAsync } = useLogin();
    const navigate = useNavigate();

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
                    onSubmit={async (credentials) => {
                        const res = await mutateAsync(credentials);
                        localStorage.setItem("auth_token", res.accessToken);
                    }}
                    onSuccess={() => navigate("/")}
                />
            </div>
        </div>
    );
}