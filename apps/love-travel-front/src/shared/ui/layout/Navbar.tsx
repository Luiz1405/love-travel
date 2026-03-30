import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/login/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target as Node)) setOpen(false);
        }
        function onEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onEsc);
        return () => {
            document.removeEventListener('click', onDocClick);
            document.removeEventListener('keydown', onEsc);
        };
    }, []);

    function handleLogout() {
        logout();
        queryClient.clear();
        navigate('/login', { replace: true });
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto max-w-6xl h-20 px-6 md:px-8 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 select-none">
                    <span className="inline-grid h-8 w-8 place-items-center rounded-md bg-blue-100 text-blue-600">✈</span>
                    <span className="text-2xl font-semibold text-blue-600 tracking-tight">Love Travel</span>
                </Link>

                {!isAuthenticated ? (
                    <Link
                        to="/login"
                        className="inline-flex h-10 items-center rounded-xl bg-blue-100 text-blue-700 px-3 font-medium ring-1 ring-black/5 hover:bg-blue-200"
                    >
                        Entrar
                    </Link>
                ) : (
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={open}
                            onClick={() => setOpen((v) => !v)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-sm ring-1 ring-black/5 hover:bg-blue-200"
                        >
                            👤
                        </button>

                        {open && (
                            <div
                                role="menu"
                                tabIndex={-1}
                                className="absolute right-0 mt-2 w-56 rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5"
                            >
                                <Link
                                    role="menuitem"
                                    to="/travels"
                                    className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={() => setOpen(false)}
                                >
                                    Minhas viagens
                                </Link>
                                <Link
                                    role="menuitem"
                                    to="/travels/create"
                                    className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={() => setOpen(false)}
                                >
                                    Cadastrar uma viagem
                                </Link>
                                <button
                                    role="menuitem"
                                    className="w-full text-left rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                    onClick={handleLogout}
                                >
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}