import { Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

type FeatureUnavailableProps = {
    title?: string;
    description?: string;
    backTo?: string;
    backLabel?: string;
};

export function FeatureUnavailable({
    title = 'Funcionalidade indisponível',
    description = 'Esta funcionalidade não está disponível no momento.',
    backTo = '/',
    backLabel = 'Voltar para início',
}: FeatureUnavailableProps) {
    return (
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-600">
                <Ban className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-slate-900">{title}</h2>
            <p className="mb-6 text-slate-600">{description}</p>
            <div className="flex justify-center">
                <Link
                    to={backTo}
                    className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                    {backLabel}
                </Link>
            </div>
        </div>
    );
}

