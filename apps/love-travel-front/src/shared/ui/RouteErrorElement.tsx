import { isAxiosError } from 'axios';
import { useRouteError } from 'react-router-dom';
import { Navbar } from '../../shared/ui/layout/Navbar';
import { FeatureUnavailable } from '../../shared/ui/FeatureUnavailable';

type RouterError = {
    status?: number;
    data?: { message?: string; statusCode?: number; error?: string };
    message?: string;
};

export function RouteErrorElement() {
    const error = useRouteError() as unknown as RouterError;
    const status = error?.status ?? error?.data?.statusCode;
    const message = error?.data?.message ?? error?.message;

    if (status === 403) {
        return (
            <div className="min-h-dvh bg-sky-50">
                <Navbar />
                <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                    <FeatureUnavailable
                        title="Funcionalidade indisponível"
                        description={typeof message === 'string' ? message : 'Esta funcionalidade não está disponível no momento.'}
                        backTo="/"
                        backLabel="Voltar"
                    />
                </main>
            </div>
        );
    }

    if (isAxiosError(error) && error.response?.status === 403) {
        const axiosMessage = error.response.data?.message;
        return (
            <div className="min-h-dvh bg-sky-50">
                <Navbar />
                <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                    <FeatureUnavailable
                        title="Funcionalidade indisponível"
                        description={typeof axiosMessage === 'string' ? axiosMessage : 'Esta funcionalidade não está disponível no momento.'}
                        backTo="/"
                        backLabel="Voltar"
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-sky-50">
            <Navbar />
            <main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <h2 className="mb-2 text-2xl font-semibold text-slate-900">Algo deu errado</h2>
                    <p className="mb-6 text-slate-600">
                        {typeof message === 'string' ? message : 'Ocorreu um erro inesperado. Tente novamente mais tarde.'}
                    </p>
                </div>
            </main>
        </div>
    );
}

