import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";

interface LoginFormProps {
    onSuccess: () => void;
    onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
}

export const LoginForm = ({ onSuccess, onSubmit }: LoginFormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Preencha todos os campos");
            return;
        }

        setIsLoading(true);

        try {
            await onSubmit({ email, password });
            onSuccess();
        } catch {
            setError("E-mail ou senha invalidos");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 p-4">
            <div className="text-left space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">Bem-vindo de volta</h2>
                <p className="text-slate-500 text-sm">
                    Acesse sua conta para continuar planejando e relembrando suas viagens.
                </p>
            </div>

            <button className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Continuar com Google
            </button>

            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase">ou continue com e-mail</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700">Senha</label>
                        <a href="#" className="text-xs font-semibold text-sky-500 hover:underline">Esqueceu a senha?</a>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#82C3FF] hover:bg-[#6ab3f5] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Entrar"}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500">
                Ainda não tem uma conta?{' '}
                <a href="#" className="text-sky-500 font-semibold hover:underline">Cadastre-se</a>
            </p>
        </div>
    );
};