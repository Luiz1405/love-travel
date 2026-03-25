import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: () => { },
    logout: () => { }
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(localStorage.getItem('auth_token'));
    }, []);

    const value = useMemo(
        () => ({
            isAuthenticated: !!token,
            login: (token: string) => {
                localStorage.setItem('auth_token', token);
                setToken(token);
            },
            logout: () => {
                localStorage.removeItem('auth_token')
                setToken(null);
            },
        }),
        [token]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);
