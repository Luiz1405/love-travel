import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PhotoDropzone } from './PhotoDropzone';
import type { CreateTravelPayload, TravelStatus } from '../common/types';
import { extractApiMessage } from '../../../../utils/extract-api-message';

const STATUS_OPTIONS: { label: string; value: TravelStatus }[] = [
    { label: 'Planejada', value: 'Planejado' },
    { label: 'Em andamento', value: 'Em andamento' },
    { label: 'Concluída', value: 'Concluído' },
];

export function TravelForm({
    isSubmitting,
    onSubmit,
}: {
    isSubmitting: boolean;
    onSubmit: (payload: CreateTravelPayload, photos: File[]) => Promise<void>;
}) {
    const [fieldErrors, setFieldErrors] = useState<{ endDate?: string; totalSpent?: string }>({});
    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalCost, setTotalCost] = useState('');
    const [status, setStatus] = useState<TravelStatus>('Planejado');
    const [description, setDescription] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setOk(null);
        setFieldErrors({});
        setError(null);

        if (!title || !destination || !startDate || !endDate || !totalCost) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }

        const parsedCost = Number(totalCost.replace(',', '.'));
        if (Number.isNaN(parsedCost) || parsedCost < 0) {
            setError('Informe um valor válido para o total gasto.');
            return;
        }

        const payload: CreateTravelPayload = {
            title,
            destination,
            startDate,
            endDate,
            total_spent: parsedCost,
            status,
            description: description || '',
            photos: [],
        };

        try {
            await onSubmit(payload, photos);
            setOk('Viagem cadastrada com sucesso.');

            setTitle('');
            setDestination('');
            setStartDate('');
            setEndDate('');
            setTotalCost('');
            setStatus('Planejado');
            setDescription('');
            setPhotos([]);
        } catch (err: unknown) {
            const rawMessage = extractApiMessage(err) || 'Não foi possível salvar a viagem.';
            const msgLower = rawMessage.toLowerCase();
            const isEndDateValidationError =
                (msgLower.includes('enddate') && msgLower.includes('startdate')) ||
                (msgLower.includes('data de término') && msgLower.includes('data de início')) ||
                (msgLower.includes('término') && msgLower.includes('início') && (msgLower.includes('depois de') || msgLower.includes('maior que') || msgLower.includes('after')));

            const isTotalSpentValidationError =
                msgLower.includes('total_spent') ||
                msgLower.includes('total gasto') ||
                (msgLower.includes('gasto') && (msgLower.includes('positivo') || msgLower.includes('maior que 0')));

            if (isEndDateValidationError) {
                setFieldErrors((prev) => ({ ...prev, endDate: rawMessage }));
            } else if (isTotalSpentValidationError) {
                setFieldErrors((prev) => ({ ...prev, totalSpent: rawMessage }));
            } else {
                setError(rawMessage);
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-slate-700">Título da viagem *</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Férias de Verão no Havaí"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700">Destino *</label>
                <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ex: Honolulu, Havaí"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700">Data de início *</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700">Data de término *</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        aria-invalid={!!fieldErrors.endDate}
                        aria-describedby={fieldErrors.endDate ? 'endDate-error' : undefined}
                        className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${fieldErrors.endDate
                            ? 'border-red-300 focus:ring-red-400'
                            : 'border-slate-200 focus:ring-sky-400'
                            }`}
                    />
                    {fieldErrors.endDate && (
                        <p id="endDate-error" className="mt-1 text-xs text-red-600">
                            {fieldErrors.endDate}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700">Total gasto *</label>
                    <div
                        className={`mt-1 flex items-center rounded-md border px-3 py-2 ${fieldErrors.totalSpent ? 'border-red-300' : 'border-slate-200'}`}
                    >
                        <span className="mr-2 text-slate-500 text-sm">R$</span>
                        <input
                            value={totalCost}
                            onChange={(e) => setTotalCost(e.target.value)}
                            placeholder="0,00"
                            inputMode="decimal"
                            aria-invalid={!!fieldErrors.totalSpent}
                            aria-describedby={fieldErrors.totalSpent ? 'totalSpent-error' : undefined}
                            className="w-full outline-none"
                        />
                    </div>
                    {fieldErrors.totalSpent && (
                        <p id="totalSpent-error" className="mt-1 text-xs text-red-600">
                            {fieldErrors.totalSpent}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700">Status *</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TravelStatus)}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700">Descrição</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Adicione detalhes do roteiro, lugares para visitar, dicas e anotações."
                    className="mt-1 w-full min-h-[110px] rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700">Fotos</label>
                <PhotoDropzone onFilesSelected={setPhotos} />
            </div>

            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-red-700 text-sm">{error}</div>}
            {ok && <div className="rounded-md bg-green-50 px-3 py-2 text-green-700 text-sm">{ok}</div>}

            <div className="flex items-center justify-end gap-3">
                <a
                    href="/"
                    className="inline-flex items-center rounded-md border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
                >
                    Cancelar
                </a>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-60"
                >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar Viagem
                </button>
            </div>
        </form>
    );
}
