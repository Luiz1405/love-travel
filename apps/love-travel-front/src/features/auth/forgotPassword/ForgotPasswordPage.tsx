import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

export function ForgotPasswordPage() {
    return (
        <div className="min-h-dvh grid grid-cols-1 md:grid-cols-2">
            <div className="relative hidden md:block">
                <img
                    src="/images/fundo-oceano.jpg"
                    alt="Fundo oceano"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h2 className="text-2xl font-bold drop-shadow">Não perca o acesso</h2>
                    <p className="mt-2 max-w-md text-sm text-white/90">
                        Recupere sua conta e continue acompanhando suas viagens.
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center p-6 md:p-10 bg-white">
                <div className="w-full max-w-md space-y-6">
                    <div className="mb-2">
                        <div className="text-sky-600 font-semibold">Love Travel</div>
                    </div>

                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Esqueceu a senha?</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Informe seu e‑mail e a nova senha para redefinir o acesso.
                        </p>
                    </div>

                    <ForgotPasswordForm />
                </div>
            </div>
        </div>
    );
}