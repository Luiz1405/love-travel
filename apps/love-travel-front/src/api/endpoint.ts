export const ENDPOINTS = {
    auth: {
        login: '/auth/login',
        register: '/users',
        me: '/auth/me',
        google: '/auth/google',
        googleCallback: '/auth/google/callback',
    },
    destinations: {
        featured: '/destinations/featured',
    },
    travels: {
        listAll: '/travels',
        create: '/travels',
        update: (id: string | number) => `/travels/${id}`,
        delete: (id: string | number) => `/travels/${id}`,
        detail: (id: string | number) => `/travels/${id}`,
        photos: (id: string | number) => `/travels/${id}/photos`,
    },
    users: {
        listAll: '/users',
        create: '/users',
        update: (id: string | number) => `/users/${id}`,
        delete: (id: string | number) => `/users/${id}`,
        detail: (id: string | number) => `/users/${id}`,
    },
} as const;

