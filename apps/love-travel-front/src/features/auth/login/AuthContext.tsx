import { useMemo, useState } from "react";
import { AuthContext } from "./context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => {
        try {
            return localStorage.getItem('auth_token');
        } catch {
            return null;
        }
    });

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

export default AuthProvider;
