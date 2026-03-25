export function extractApiMessage(error: any): string {
    if (typeof error === 'string') return error;
    const data = error?.response?.data;

    if (Array.isArray(data?.message?.message) && data.message.message.length) {
        return data.message.message[0];
    }

    if (Array.isArray(data?.error) && data.error.length) return data.error[0];
    if (Array.isArray(data?.message) && data.message.length) return data.message[0];
    if (typeof data?.message === 'string') return data.message;
    if (typeof error?.message === 'string') return error.message;

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