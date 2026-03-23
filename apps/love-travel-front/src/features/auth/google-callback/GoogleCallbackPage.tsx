import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const GoogleCallbackPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        localStorage.setItem("auth_token", token);
        navigate("/", { replace: true });
    }, [navigate]);

    return (
        <div className="min-h-dvh flex items-center justify-center text-slate-600">
            Finalizando login com Google...
        </div>
    );
};
