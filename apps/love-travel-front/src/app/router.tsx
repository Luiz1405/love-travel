import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "../features/home/HomePage";
import { LoginPage } from "../features/auth/login/LoginPage";
import { RegisterPage } from "../features/auth/register/RegisterPage";
import { GoogleCallbackPage } from "../features/auth/google-callback/GoogleCallbackPage";
import { ForgotPasswordPage } from "../features/auth/forgotPassword/ForgotPasswordPage";

export const router = createBrowserRouter([
    { path: '/', element: <HomePage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/forget-password', element: <ForgotPasswordPage /> },
    { path: '/auth/google/callback', element: <GoogleCallbackPage /> },
])