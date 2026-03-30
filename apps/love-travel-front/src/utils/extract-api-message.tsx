function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

export function extractApiMessage(error: unknown): string {
    if (isString(error)) return error;
    const maybeObj = error as { response?: { data?: unknown }; message?: unknown } | undefined;
    const data = maybeObj?.response?.data as unknown;

    if (data && typeof data === 'object') {
        const record = data as Record<string, unknown>;
        const messageCandidate = record.message;
        const errorCandidate = record.error;
        if (messageCandidate && typeof messageCandidate === 'object') {
            const inner = (messageCandidate as Record<string, unknown>).message;
            if (isStringArray(inner) && inner.length) return inner[0];
        }

        if (isStringArray(errorCandidate) && errorCandidate.length) return errorCandidate[0];
        if (isStringArray(messageCandidate) && messageCandidate.length) return messageCandidate[0];
        if (isString(messageCandidate)) return messageCandidate;
    }
    if (isString(maybeObj?.message)) return maybeObj.message as string;

    return 'Erro ao processar solicitação.';
}

export function mapErrorToField(rawMessage: string): {
    field?: 'email' | 'password';
    message?: string;
} {
    const msg = rawMessage.toLowerCase();

    if (msg.includes('password') || msg.includes('senha')) {
        return { field: 'password', message: rawMessage };
    }

    if (msg.includes('email') || msg.includes('e-mail')) {
        return { field: 'email', message: rawMessage };
    }

    return { message: rawMessage };
}