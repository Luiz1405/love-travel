import { useState } from "react";
import { useForgotPassword } from "../api/useForgotPassword";
import { Loader2, Lock, Mail } from "lucide-react";
import { extractApiMessage } from "../../../../utils/extract-api-message";

export function ForgotPasswordForm() {
    const { mutateAsync, isPending } = useForgotPassword();

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; newPassword?: string }>({});
    const [globalMsg, setGlobalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    function validate() {
        const errors: { email?: string; newPassword?: string } = {};

        if (!email || !email.includes('@') || !email.includes('.')) {
            errors.email = 'Informe um e‑mail válido.';
        }
        if (!newPassword || newPassword.length < 8) {
            errors.newPassword = 'A nova senha deve ter pelo menos 8 caracteres.';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setGlobalMsg(null);
        setFieldErrors({});

        if (!validate()) return;

        try {
            await mutateAsync({ email, password: newPassword });
            setGlobalMsg({ type: 'success', text: 'Senha redefinida com sucesso.' });
            setNewPassword('');
        } catch (err: unknown) {
            const msg = extractApiMessage(err) || 'Não foi possível redefinir a senha.';
            setGlobalMsg({ type: 'error', text: msg });
        }
    }

    return (
        <form className="space-y-5" noValidate onSubmit={onSubmit}>
            {globalMsg && (
                <div
                    role="alert"
                    className={
                        globalMsg.type === 'success'
                            ? 'rounded-md bg-green-50 px-3 py-2 text-sm text-green-700'
                            : 'rounded-md bg-red-50 px-3 py-2 text-sm text-red-700'
                    }
                >
                    {globalMsg.text}
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    E‑mail
                </label>
                <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    />
                </div>
                {fieldErrors.email && (
                    <p id="email-error" className="mt-1 text-xs text-red-600">
                        {fieldErrors.email}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700">
                    Nova senha
                </label>
                <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        aria-invalid={!!fieldErrors.newPassword}
                        aria-describedby={fieldErrors.newPassword ? 'newPassword-error' : undefined}
                    />
                </div>
                {fieldErrors.newPassword && (
                    <p id="newPassword-error" className="mt-1 text-xs text-red-600">
                        {fieldErrors.newPassword}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#82C3FF] hover:bg-[#6ab3f5] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
            >
                {isPending ? <Loader2 className="animate-spin mr-2" /> : 'Redefinir senha'}
            </button>

            <p className="text-center text-sm text-slate-500">
                Lembrou a senha?{' '}
                <a href="/login" className="text-sky-500 font-semibold hover:underline">
                    Voltar para o login
                </a>
            </p>
        </form>
    );
}