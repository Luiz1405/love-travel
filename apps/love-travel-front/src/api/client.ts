import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const GENERIC_AUTH_PATHS = ['/auth/login', '/auth/register'];

function isPublicAuthFailure(config: { url?: string; baseURL?: string } | undefined): boolean {
    const url = config?.url ?? '';
    const full = `${config?.baseURL ?? ''}${url}`;
    return GENERIC_AUTH_PATHS.some(
        (p) => url === p || url.endsWith(p) || full.includes(p)
    );
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401 && !isPublicAuthFailure(error?.config)) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

