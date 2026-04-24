import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => {
        try {
            return localStorage.getItem('auth_token');
        } catch {
            return null;
        }
    });

    const login = useCallback((nextToken: string) => {
        localStorage.setItem('auth_token', nextToken);
        setToken(nextToken);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('auth_token');
        setToken(null);
    }, []);

    const value = useMemo(
        () => ({
            isAuthenticated: !!token,
            login,
            logout,
        }),
        [token, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider;
