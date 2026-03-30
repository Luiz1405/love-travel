import { useNavigate } from 'react-router-dom';
import { useCreateTravel } from './api/useCreateTravel';
import { TravelForm } from './components/TravelForm';
import type { CreateTravelPayload } from './common/types';
import { Navbar } from '../../../shared/ui/layout/Navbar';

export function CreateTravelPage() {
    const navigate = useNavigate();
    const { mutateAsync: createTravel, isPending } = useCreateTravel();

    async function handleSubmit(payload: CreateTravelPayload, photos: File[]) {
        await createTravel({ payload, photos });
        navigate('/travels');
    }

    return (
        <div className="min-h-dvh bg-sky-50">
            <Navbar />
            <div className="py-8">
                <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                    <h1 className="text-2xl font-bold text-slate-900">Cadastrar Viagem</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Preencha os detalhes abaixo para registrar sua próxima aventura.
                    </p>
                    <div className="mt-6">
                        <TravelForm isSubmitting={isPending} onSubmit={handleSubmit} />
                    </div>
                </div>
            </div>
        </div>
    );
}