export function toErrorMessage(value: unknown, fallback = 'Ocorreu um erro inesperado.'): string {

    if (typeof value === 'string') return value.trim() || fallback;

    if (Array.isArray(value)) {
        const firstString = value.find((v) => typeof v === 'string') as string | undefined;
        if (firstString) return firstString;
        return value.map((v) => (typeof v === 'string' ? v : '')).filter(Boolean).join('\n') || fallback;
    }

    if (value && typeof value === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj = value as any;
        if (obj.message !== undefined) {
            return toErrorMessage(obj.message, fallback);
        }
        if (typeof obj.error === 'string' && obj.error.trim()) {
            return obj.error;
        }
        return fallback;
    }

    return fallback;
}

