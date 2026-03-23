export function Benefits() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
                <div>
                    <h3 className="text-4xl md:text-5xl font-bold text-slate-950">
                        Guarde cada momento especial
                    </h3>
                    <p className="mt-3 text-slate-600">
                        Ao cadastrar suas viagens, você cria um diário virtual com datas, locais e fotos.
                        Tenha todas as as suas memórias acessíveis de qualquer lugar, a qualquer momento.
                    </p>
                    <ul className="mt-6 space-y-3 text-slate-700">
                        <li className="flex items-start gap-4">
                            <span className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 grid place-items-center ring-1 ring-blue-100/50 shadow-inner">🗺</span>
                            Mapeie seus roteiros detalhadamente
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 grid place-items-center ring-1 ring-blue-100/50 shadow-inner">📷</span>
                            Anexe fotos incríveis da sua viagem
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 grid place-items-center ring-1 ring-blue-100/50 shadow-inner">🗂</span>
                            Organize tudo por datas e eventos
                        </li>
                    </ul>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 aspect-[4/5]">
                    <img
                        src="/images/home-page-image.jpg"
                        alt="Explorar novos horizontes"
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>
        </section>
    )
}