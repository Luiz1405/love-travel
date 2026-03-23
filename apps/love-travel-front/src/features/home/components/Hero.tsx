import { Link } from "react-router-dom";
import { Button } from "../../../shared/ui/Button";

export function Hero() {
    return (
        <section className="bg-blue-50">
            <div className="mx-auto max-w-5xl px-4 py-16 text-center">
                <p className="mx-auto inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Planeje sua próxima aventura
                </p>
                <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-slate-900">
                    O mundo está esperando<br />por você
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-slate-600">
                    Organize suas viagens, registre memórias inesquecíveis e descubra novos destinos com
                    nossa plataforma focada em você.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                    <Link to="/travels/new">
                        <Button size="lg">Cadastrar uma viagem</Button>
                    </Link>
                    <Link to="/travels">
                        <Button variant="ghost" size="lg">Ver minhas viagens</Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}