import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../../shared/ui/layout/Navbar';
import { TravelService } from '../../../services/travel/travel-service';
import type { TravelStatus } from '../create/common/types';
import { extractApiMessage } from '../../../utils/extract-api-message';
import { PhotoDropzone } from '../create/components/PhotoDropzone';

const STATUS_OPTIONS: { label: string; value: TravelStatus }[] = [
    { label: 'Planejada', value: 'Planejado' },
    { label: 'Em andamento', value: 'Em andamento' },
    { label: 'Concluída', value: 'Concluído' },
];

export function UpdateTravelPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalCost, setTotalCost] = useState('');
    const [status, setStatus] = useState<TravelStatus>('Planejado');
    const [description, setDescription] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['travel', id],
        queryFn: () => TravelService.getById(id),
        enabled: !!id,
    });

    useEffect(() => {
        if (!data) return;
        setTitle(data.title ?? '');
        setDestination(data.destination ?? '');
        setStartDate(toInputDate(data.startDate));
        setEndDate(toInputDate(data.endDate));
        setTotalCost(String(data.total_spent ?? ''));
        setStatus((data.status ?? 'Planejado') as TravelStatus);
        setDescription(data.description ?? '');
    }, [data]);

    const { mutateAsync: updateTravel, isPending } = useMutation({
        mutationFn: (payload: {
            title: string;
            destination: string;
            startDate: string;
            endDate: string;
            total_spent: number;
            status: TravelStatus;
            description: string;
        }) => TravelService.update(id, payload),
    });

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const parsedCost = Number(totalCost.replace(',', '.'));
        if (Number.isNaN(parsedCost) || parsedCost <= 0) {
            setError('Informe um valor válido para o total gasto.');
            return;
        }

        try {
            if (photos.length > 0) {
                const form = new FormData();
                form.append('title', title);
                form.append('destination', destination);
                form.append('startDate', startDate);
                form.append('endDate', endDate);
                form.append('total_spent', String(parsedCost));
                form.append('status', status);
                form.append('description', description);
                photos.forEach((file) => form.append('photos', file));
                await updateTravel(form as any);
            } else {
                await updateTravel({
                    title,
                    destination,
                    startDate,
                    endDate,
                    total_spent: parsedCost,
                    status,
                    description,
                });
            }
            navigate('/travels');
        } catch (err) {
            setError(extractApiMessage(err));
        }
    }

    return (
        <div className="min-h-dvh bg-sky-50">
            <Navbar />
            <div className="py-8">
                <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
                    <h1 className="text-2xl font-bold text-slate-900">Atualizar Viagem</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Edite os detalhes da sua viagem e salve as alterações.
                    </p>

                    {isLoading && (
                        <div className="mt-6 flex items-center gap-2 text-slate-600">
                            <Loader2 className="h-4 w-4 animate-spin" /> Carregando dados da viagem...
                        </div>
                    )}
                    {isError && (
                        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                            Não foi possível carregar os dados da viagem.
                        </p>
                    )}

                    {!isLoading && !isError && (
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Título da viagem *</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Destino *</label>
                                <input
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                    <label className="block text-sm font-semibold text-slate-700">Data de término</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Total gasto *</label>
                                    <div className="mt-1 flex items-center rounded-md border border-slate-200 px-3 py-2">
                                        <span className="mr-2 text-sm text-slate-500">R$</span>
                                        <input
                                            value={totalCost}
                                            onChange={(e) => setTotalCost(e.target.value)}
                                            className="w-full outline-none"
                                        />
                                    </div>
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
                                    className="mt-1 min-h-[110px] w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Adicionar novas fotos</label>
                                <p className="mt-1 text-xs text-slate-500">
                                    As fotos escolhidas aqui serão adicionadas às fotos já existentes da viagem.
                                </p>
                                <div className="mt-2">
                                    <PhotoDropzone onFilesSelected={setPhotos} />
                                </div>
                            </div>

                            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

                            <div className="flex items-center justify-end gap-3">
                                <Link
                                    to="/travels"
                                    className="inline-flex items-center rounded-md border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-60"
                                >
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Salvar alterações
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function toInputDate(value?: string) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
}
