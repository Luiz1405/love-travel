import { useState } from "react";
import { Mail, Lock, Loader2, User } from "lucide-react";
import { API_URLS } from "../../../../api/urls";
import { extractApiMessage, mapErrorToField } from "../../../../utils/extract-api-message";

interface RegisterFormProps {
    onSuccess: () => void;
    onSubmit: (credentials: { name: string; email: string; password: string }) => Promise<void>;
}

export const RegisterForm = ({ onSuccess, onSubmit }: RegisterFormProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        if (!name || !email || !password) {
            setError("Preencha todos os campos");
            return;
        }

        setIsLoading(true);

        try {
            await onSubmit({ name, email, password });
            onSuccess();
        } catch (err) {
            const rawMessage = extractApiMessage(err);
            const mappedError = mapErrorToField(rawMessage);

            if (mappedError.field) {
                setFieldErrors((prev) => ({ ...prev, [mappedError.field!]: mappedError.message }));
            } else {
                setError(mappedError.message || "Erro ao cadastrar");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 p-4">
            <div className="text-left space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">Crie sua conta</h2>
                <p className="text-slate-500 text-sm">
                    Junte-se a nós para começar a planejar e registrar suas viagens.
                </p>
            </div>

            <a
                href={API_URLS.google}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
            >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Cadastrar com Google
            </a>

            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase">ou cadastre-se com e-mail</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nome</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                            aria-invalid={!!fieldErrors.email}
                            aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
                        />
                        {fieldErrors.email && (
                            <p id="register-email-error" className="mt-1 text-xs text-red-500">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Senha</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                            aria-invalid={!!fieldErrors.password}
                            aria-describedby={fieldErrors.password ? "register-password-error" : undefined}
                        />
                        {fieldErrors.password && (
                            <p id="register-password-error" className="mt-1 text-xs text-red-500">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>
                </div>

                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#82C3FF] hover:bg-[#6ab3f5] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Cadastrar"}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500">
                Já tem uma conta?{' '}
                <a href="/login" className="text-sky-500 font-semibold hover:underline">Entrar</a>
            </p>
        </div>
    );
};