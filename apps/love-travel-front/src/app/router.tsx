import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "../features/home/HomePage";
import { LoginPage } from "../features/auth/login/LoginPage";
import { RegisterPage } from "../features/auth/register/RegisterPage";
import { GoogleCallbackPage } from "../features/auth/google-callback/GoogleCallbackPage";
import { ForgotPasswordPage } from "../features/auth/forgotPassword/ForgotPasswordPage";
import { RequireAuth } from "./RequireAuth";
import { CreateTravelPage } from "../features/travels/create/CreateTravelPage";
import { ListTravelsPage } from "../features/travels/list/ListTravelsPage";
import { UpdateTravelPage } from "../features/travels/update/UpdateTravelPage";
import { RouteErrorElement } from "../shared/ui/RouteErrorElement";

export const router = createBrowserRouter([
    { path: '/', element: <HomePage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/forget-password', element: <ForgotPasswordPage /> },
    { path: '/auth/google/callback', element: <GoogleCallbackPage /> },
    {
        path: '/travels', element: <RequireAuth />, errorElement: <RouteErrorElement />, children: [
            { index: true, element: <ListTravelsPage /> },
            { path: 'create', element: <CreateTravelPage /> },
            { path: ':id/update', element: <UpdateTravelPage /> },
        ]
    },
])