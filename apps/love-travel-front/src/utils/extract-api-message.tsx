export function extractApiMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    const maybeObj = error as { response?: { data?: any }, message?: unknown } | undefined;
    const data = maybeObj?.response?.data;

    if (Array.isArray(data?.message?.message) && data.message.message.length) {
        return data.message.message[0];
    }

    if (Array.isArray(data?.error) && data.error.length) return data.error[0];
    if (Array.isArray(data?.message) && data.message.length) return data.message[0];
    if (typeof data?.message === 'string') return data.message;
    if (typeof maybeObj?.message === 'string') return maybeObj.message;

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