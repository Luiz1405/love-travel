import { ENDPOINTS } from "./endpoint";


const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const API_URLS = {
    google: `${API_BASE_URL}${ENDPOINTS.auth.google}`,
    googleCallback: `${API_BASE_URL}${ENDPOINTS.auth.googleCallback}`,
} as const;