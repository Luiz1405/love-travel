import { useMemo, useRef, useState, useEffect, type UIEvent } from 'react';
import { Card } from '../../../shared/ui/Card';

const FEATURED = [
    { id: 'praias', name: 'Praias Tropicais', coverUrl: '/images/praias-tropicais.jpg' },
    { id: 'historico', name: 'Cidades Históricas', coverUrl: '/images/centro-historico.jpg' },
    { id: 'neve', name: 'Aventura na Neve', coverUrl: '/images/aventura-neve.jpg' },
    { id: 'paradisiacas', name: 'Praias Paradisíacas', coverUrl: '/images/praias-paradisiacas.jpg' },
    { id: 'fundo-oceano', name: 'Explorar o Oceano', coverUrl: '/images/fundo-oceano.jpg' },
];

export function FeaturedCarousel() {
    const containerRef = useRef<HTMLDivElement>(null);

    const slidesPerView = useResponsiveSlidesPerView();
    const [index, setIndex] = useState(0);

    const maxIndex = useMemo(() => {
        return Math.max(0, FEATURED.length - slidesPerView);
    }, [slidesPerView]);

    // Atualiza índice quando usuário faz scroll manual (mouse/touch)
    function onScroll(e: UIEvent<HTMLDivElement>) {
        const el = e.currentTarget;
        const slideWidth = el.clientWidth / slidesPerView;
        const newIndex = Math.round(el.scrollLeft / slideWidth);
        setIndex(Math.min(Math.max(newIndex, 0), maxIndex));
    }

    function scrollToIndex(target: number) {
        const el = containerRef.current;
        if (!el) return;
        const slideWidth = el.clientWidth / slidesPerView;
        el.scrollTo({ left: target * slideWidth, behavior: 'smooth' });
    }

    function prev() {
        scrollToIndex(Math.max(index - 1, 0));
    }

    function next() {
        scrollToIndex(Math.min(index + 1, maxIndex));
    }

    // Sincroniza snapping ao redimensionar
    useEffect(() => {
        scrollToIndex(index);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slidesPerView]);

    return (
        <section className="bg-white" aria-labelledby="featured-heading">
            <div className="mx-auto max-w-6xl px-4 py-14">
                <h2 id="featured-heading" className="text-2xl md:text-3xl font-bold text-slate-900 text-center">
                    Destinos em destaque
                </h2>
                <p className="mt-2 text-center text-slate-600">
                    Inspire-se para a sua próxima viagem com esses destinos incríveis.
                </p>

                <div className="relative mt-8">
                    {/* Botões navegação: absolutos para sobrepor ao carrossel */}
                    <button
                        type="button"
                        aria-label="Anterior"
                        onClick={prev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 shadow ring-1 ring-black/10 p-2 hover:bg-white"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        aria-label="Próximo"
                        onClick={next}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 shadow ring-1 ring-black/10 p-2 hover:bg-white"
                    >
                        ›
                    </button>

                    {/* Trilho do carrossel (scroll horizontal + snap) */}
                    <div
                        ref={containerRef}
                        onScroll={onScroll}
                        className="
                  flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory
                  scrollbar-none
                  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                  px-10
                "
                        role="region"
                        aria-roledescription="carousel"
                        aria-label="Destinos em destaque"
                    >
                        {FEATURED.map((d) => (
                            <Card
                                key={d.id}
                                className="
                      snap-start shrink-0 overflow-hidden
                      w-[85%] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)]
                    "
                            >
                                <div className="relative h-48">
                                    <img
                                        src={d.coverUrl}
                                        alt={d.name}
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                </div>
                                <div className="p-3">
                                    <span className="inline-block rounded bg-white/90 px-2 py-1 text-xs font-medium shadow-sm ring-1 ring-black/5">
                                        {d.name}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Indicadores (opcional) */}
                    <div className="mt-4 flex justify-center gap-2">
                        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                            <button
                                key={i}
                                aria-label={`Ir para slide ${i + 1}`}
                                onClick={() => scrollToIndex(i)}
                                className={`h-2 w-2 rounded-full ${i === index ? 'bg-blue-600' : 'bg-slate-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/**
 * Decide quantos slides por view conforme o breakpoint atual.
 * Mantemos em um hook para separar responsabilidade (legibilidade).
 */
function useResponsiveSlidesPerView() {
    // Simples: usar matchMedia; poderia ser um hook de breakpoint global.
    const [count, setCount] = useState(1);

    useEffect(() => {
        const mSm = window.matchMedia('(min-width: 640px)');   // sm
        const mMd = window.matchMedia('(min-width: 768px)');   // md

        function update() {
            if (mMd.matches) setCount(3);
            else if (mSm.matches) setCount(2);
            else setCount(1);
        }

        update();
        mSm.addEventListener('change', update);
        mMd.addEventListener('change', update);
        return () => {
            mSm.removeEventListener('change', update);
            mMd.removeEventListener('change', update);
        };
    }, []);

    return count;
}