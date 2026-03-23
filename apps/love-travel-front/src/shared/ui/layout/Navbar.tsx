import { Link, NavLink } from 'react-router-dom';

export function Navbar() {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 ">
            <div className="mx-auto max-w-6xl h-20 px-6 md:px-8 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 select-none">
                    <span className="inline-grid h-8 w-8 place-items-center rounded-md bg-blue-100 text-blue-600">✈</span>
                    <span className="text-2xl font-semibold text-blue-600 tracking-tight">Love Travel</span>
                </Link>
                <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-12">
                    <NavLink to="/travels" className={({ isActive }) => isActive ? 'text-slate-900 font-semibold' : 'text-slate-700 hover:text-slate-900'}>
                        Minhas viagens
                    </NavLink>
                    <NavLink to="/travels/new" className={({ isActive }) => isActive ? 'text-slate-900 font-semibold' : 'text-slate-700 hover:text-slate-900'}>
                        Cadastrar uma viagem
                    </NavLink>
                </nav>
                <button
                    type="button"
                    aria-label="Perfil"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-sm ring-1 ring-black/5 hover:bg-blue-200 transition-colors"
                >
                    👤
                </button>
            </div>
        </header>
    );
}