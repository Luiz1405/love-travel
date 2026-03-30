import { RegisterForm } from "./components/RegisterForm";
import { useRegister } from "./api/useRegister";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../login/useAuth";

export function RegisterPage() {
    const { mutateAsync } = useRegister();
    const { login } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-dvh grid grid-cols-1 md:grid-cols-2">
            <div className="relative hidden md:block">
                <img
                    src="/images/aventura-neve.jpg"
                    alt="Praia paradisíaca"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h2 className="text-2xl font-bold drop-shadow">Comece sua proxima aventura</h2>
                    <p className="mt-2 max-w-md text-sm text-white/90">
                        Crie sua conta para planejar viagens, guardar memórias e descobrir destinos.
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center p-6 md:p-10 bg-white">
                <RegisterForm
                    onSubmit={async (credentials) => {
                        const res = await mutateAsync(credentials);
                        const token = res?.accessToken ?? res?.access_token;
                        if (!token) {
                            navigate("/login");
                            return;
                        }
                        login(token);
                    }}
                    onSuccess={() => navigate("/login", { state: { successMessage: "Cadastro realizado com sucesso" } })}
                />
            </div>
        </div>
    );
}
