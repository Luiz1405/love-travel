import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../login/useAuth";

export const GoogleCallbackPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("token");

        if (tokenFromUrl) {
            login(tokenFromUrl);
            navigate("/", { replace: true });
            return;
        }

        const existing = localStorage.getItem("auth_token");
        if (existing) {
            login(existing);
            navigate("/", { replace: true });
            return;
        }

        navigate("/login", { replace: true });
    }, [navigate, login]);

    return (
        <div className="min-h-dvh flex items-center justify-center text-slate-600">
            Finalizando login com Google...
        </div>
    );
};
