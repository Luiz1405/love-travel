export const ENDPOINTS = {
    auth: {
        login: '/auth/login',
        me: '/auth/me',
    },
    destinations: {
        featured: '/destinations/featured',
    },
    travels: {
        list: '/travels',
        create: '/travels',
        detail: (id: string | number) => `/travels/${id}`,
        photos: (id: string | number) => `/travels/${id}/photos`,
    }
} as const;

