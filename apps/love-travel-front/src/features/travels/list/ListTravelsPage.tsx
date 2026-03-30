import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError, type AxiosError } from 'axios';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Pencil, Search, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../../shared/ui/layout/Navbar';
import { TravelService } from '../../../services/travel/travel-service';
import { useTravels } from './api/useTravels';
import type { Travel } from './common/types';
import { FeatureUnavailable } from '../../../shared/ui/FeatureUnavailable';
import { toErrorMessage } from '../../../shared/utils/error';

const PAGE_SIZE = 3;
const GALLERY_PAGE_SIZE = 6;
const CAROUSEL_INTERVAL_MS = 3500;

export function ListTravelsPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [travelPage, setTravelPage] = useState(1);
    const [selectedTravelId, setSelectedTravelId] = useState<string | null>(null);
    const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);
    const [galleryPage, setGalleryPage] = useState(1);
    const [travelPendingDelete, setTravelPendingDelete] = useState<Travel | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [search]);

    useEffect(() => {
        setTravelPage(1);
    }, [debouncedSearch]);

    const { data: travels = [], isLoading, isError, error } = useTravels({
        page: travelPage,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch,
    });
    const { mutate: deleteTravel, isPending: isDeleting } = useMutation({
        mutationFn: (id: string) => TravelService.remove(id),
        onSuccess: (_, deletedId) => {
            setDeleteError(null);
            queryClient.setQueriesData({ queryKey: ['travels'] }, (oldData: Travel[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.filter((travel) => getTravelId(travel) !== deletedId);
            });
            setSelectedTravelId((prev) => (prev === deletedId ? null : prev));
            setTravelPendingDelete(null);
            queryClient.invalidateQueries({ queryKey: ['travels'] });
        },
        onError: (error, deletedId) => {
            const status = (error as AxiosError)?.response?.status;
            if (status === 404) {
                queryClient.setQueriesData({ queryKey: ['travels'] }, (oldData: Travel[] | undefined) => {
                    if (!oldData) return oldData;
                    return oldData.filter((travel) => getTravelId(travel) !== deletedId);
                });
                setSelectedTravelId((prev) => (prev === deletedId ? null : prev));
                setTravelPendingDelete(null);
                setDeleteError(null);
                queryClient.invalidateQueries({ queryKey: ['travels'] });
                return;
            }

            setDeleteError('Não foi possível excluir a viagem. Tente novamente.');
        },
    });

    const filteredTravels = useMemo(() => travels, [travels]);

    useEffect(() => {
        if (!filteredTravels.length) {
            setSelectedTravelId(null);
            return;
        }

        const hasSelectedInList = filteredTravels.some((travel) => getTravelId(travel) === selectedTravelId);
        if (!selectedTravelId || !hasSelectedInList) {
            setSelectedTravelId(getTravelId(filteredTravels[0]));
        }
    }, [filteredTravels, selectedTravelId]);

    const selectedTravel = filteredTravels.find((travel) => getTravelId(travel) === selectedTravelId) ?? null;

    useEffect(() => {
        setHeroPhotoIndex(0);
        setGalleryPage(1);
    }, [selectedTravelId]);

    const heroPhotos = selectedTravel?.photos ?? [];
    const heroImage = heroPhotos[heroPhotoIndex] ?? '/images/praias-tropicais.jpg';

    useEffect(() => {
        if (heroPhotos.length <= 1) return;
        const intervalId = window.setInterval(() => {
            setHeroPhotoIndex((prev) => (prev + 1) % heroPhotos.length);
        }, CAROUSEL_INTERVAL_MS);
        return () => window.clearInterval(intervalId);
    }, [heroPhotos]);

    const galleryPhotos = selectedTravel?.photos ?? [];
    const galleryTotalPages = Math.max(1, Math.ceil(galleryPhotos.length / GALLERY_PAGE_SIZE));

    useEffect(() => {
        if (galleryPage > galleryTotalPages) {
            setGalleryPage(galleryTotalPages);
        }
    }, [galleryPage, galleryTotalPages]);

    const galleryStart = (galleryPage - 1) * GALLERY_PAGE_SIZE;
    const currentGallery = galleryPhotos.slice(galleryStart, galleryStart + GALLERY_PAGE_SIZE);

    if (isError) {
        if (isAxiosError(error) && error.response?.status === 403) {
            const data = error.response?.data as unknown as { message?: unknown; error?: unknown } | undefined;
            const candidate = data?.message ?? data?.error ?? (error.message || undefined);
            const description = toErrorMessage(candidate, 'Esta funcionalidade não está disponível no momento.');
            return (
                <div className="min-h-dvh bg-sky-50">
                    <Navbar />
                    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                        <FeatureUnavailable
                            title="Funcionalidade indisponível"
                            description={description}
                            backTo="/"
                            backLabel="Voltar"
                        />
                    </main>
                </div>
            );
        }
    }

    return (
        <div className="min-h-dvh bg-sky-50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
                <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link to="/travels" className="rounded-md bg-sky-100 px-3 py-1.5 font-medium text-sky-700">
                            Minhas viagens
                        </Link>
                        <Link to="/travels/create" className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100">
                            Cadastrar uma viagem
                        </Link>
                    </nav>
                </header>

                <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                    <aside className="rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 px-4 py-4">
                            <h1 className="text-2xl font-bold text-slate-900">Minhas Viagens</h1>
                            <label className="mt-4 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">
                                <Search className="h-4 w-4" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar destinos..."
                                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                />
                            </label>
                        </div>

                        <div className="space-y-3 px-4 py-4">
                            {isLoading && <p className="text-sm text-slate-500">Carregando viagens...</p>}
                            {isError && <p className="text-sm text-red-600">Não foi possível carregar as viagens.</p>}

                            {!isLoading && !filteredTravels.length && (
                                <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">
                                    Nenhuma viagem encontrada nesta página.
                                </p>
                            )}

                            {filteredTravels.map((travel) => {
                                const travelId = getTravelId(travel);
                                const isSelected = travelId === selectedTravelId;
                                const thumb = travel.photos[0] ?? '/images/praias-paradisiacas.jpg';

                                return (
                                    <div
                                        key={travelId}
                                        onClick={() => setSelectedTravelId(travelId)}
                                        className={`w-full cursor-pointer rounded-lg border p-2 text-left transition ${isSelected
                                            ? 'border-sky-300 bg-sky-50'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <img src={thumb} alt={travel.title} className="h-14 w-14 rounded object-cover" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="truncate text-sm font-semibold text-slate-800">{travel.title}</p>
                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            to={`/travels/${travelId}/update`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex rounded border border-slate-300 p-1 text-slate-500 hover:bg-slate-100"
                                                            aria-label={`Editar viagem ${travel.title}`}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            disabled={isDeleting}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteError(null);
                                                                setTravelPendingDelete(travel);
                                                            }}
                                                            className="inline-flex rounded border border-red-200 p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
                                                            aria-label={`Excluir viagem ${travel.title}`}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">{formatDateRange(travel.startDate, travel.endDate)}</p>
                                                <span className={`mt-2 inline-flex rounded px-2 py-0.5 text-[11px] font-medium ${statusClass(travel.status)}`}>
                                                    {travel.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
                            <button
                                type="button"
                                onClick={() => setTravelPage((prev) => Math.max(1, prev - 1))}
                                disabled={travelPage === 1}
                                className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </button>
                            <span>Página {travelPage}</span>
                            <button
                                type="button"
                                onClick={() => setTravelPage((prev) => prev + 1)}
                                disabled={travels.length < PAGE_SIZE}
                                className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
                            >
                                Próxima
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </footer>
                    </aside>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-7">
                        {!selectedTravel ? (
                            <p className="text-slate-500">Selecione uma viagem para ver os detalhes.</p>
                        ) : (
                            <>
                                <div className="relative h-64 overflow-hidden rounded-lg md:h-80">
                                    <img src={heroImage} alt={selectedTravel.title} className="h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-black/10" />
                                    <div className="absolute bottom-0 w-full p-6 text-white">
                                        <h2 className="text-4xl font-bold">{selectedTravel.title}</h2>
                                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-100">
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {selectedTravel.destination}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <CalendarDays className="h-4 w-4" />
                                                {formatDateRange(selectedTravel.startDate, selectedTravel.endDate)}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Users className="h-4 w-4" />2 viajantes
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold text-slate-900">Sobre a viagem</h3>
                                    <p className="mt-3 text-slate-600">
                                        {selectedTravel.description?.trim() || 'Sem descrição cadastrada para esta viagem.'}
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-2xl font-bold text-slate-900">
                                            Galeria de Fotos ({galleryPhotos.length})
                                        </h3>
                                    </div>

                                    {currentGallery.length ? (
                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                            {currentGallery.map((photo, index) => (
                                                <img
                                                    key={`${photo}-${index}`}
                                                    src={photo}
                                                    alt={`Foto ${galleryStart + index + 1} da viagem`}
                                                    className="h-44 w-full rounded-md object-cover"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">Esta viagem ainda não possui fotos.</p>
                                    )}

                                    {galleryPhotos.length > GALLERY_PAGE_SIZE && (
                                        <div className="mt-4 flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setGalleryPage((prev) => Math.max(1, prev - 1))}
                                                disabled={galleryPage === 1}
                                                className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                                            >
                                                Anterior
                                            </button>
                                            <span className="text-sm text-slate-600">
                                                Página {galleryPage} de {galleryTotalPages}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setGalleryPage((prev) => Math.min(galleryTotalPages, prev + 1))}
                                                disabled={galleryPage === galleryTotalPages}
                                                className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                                            >
                                                Próxima
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>

            {travelPendingDelete && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl ring-1 ring-black/5">
                        <h3 className="text-lg font-semibold text-slate-900">Excluir viagem</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Tem certeza que deseja excluir a viagem "{travelPendingDelete.title}"? Essa ação não pode ser desfeita.
                        </p>
                        {deleteError && (
                            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{deleteError}</p>
                        )}
                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setTravelPendingDelete(null)}
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => deleteTravel(getTravelId(travelPendingDelete))}
                                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {isDeleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getTravelId(travel: Travel) {
    return travel._id ?? travel.id ?? travel.title;
}

function formatDateRange(startDate: string, endDate?: string) {
    const start = formatDate(startDate);
    if (!endDate) return start;
    return `${start} - ${formatDate(endDate)}`;
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusClass(status: Travel['status']) {
    if (status === 'Concluído') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Em andamento') return 'bg-amber-100 text-amber-700';
    return 'bg-sky-100 text-sky-700';
}
