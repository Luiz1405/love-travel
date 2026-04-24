function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

type ValidationErrorLike = {
    constraints?: Record<string, string>;
    children?: unknown[];
};

function firstConstraintMessage(validationNode: unknown): string | undefined {
    if (!validationNode || typeof validationNode !== 'object') return undefined;
    const validationError = validationNode as ValidationErrorLike;
    if (validationError.constraints && typeof validationError.constraints === 'object') {
        const constraintMessages = Object.values(validationError.constraints).filter(isString);
        if (constraintMessages.length) return constraintMessages[0];
    }
    if (Array.isArray(validationError.children)) {
        for (const childError of validationError.children) {
            const messageFromChild = firstConstraintMessage(childError);
            if (messageFromChild) return messageFromChild;
        }
    }
    return undefined;
}

function firstReadableFromValidationList(list: unknown[]): string | undefined {
    for (const item of list) {
        if (isString(item) && item.trim()) return item;
        const fromConstraints = firstConstraintMessage(item);
        if (fromConstraints) return fromConstraints;
    }
    return undefined;
}

function unwrapMessagePayload(payload: unknown, depth = 0): unknown {
    const maxNestingDepth = 6;
    const isPlainObject =
        payload !== null &&
        typeof payload === 'object' &&
        !Array.isArray(payload);

    if (depth > maxNestingDepth || !isPlainObject) {
        return payload;
    }
    const bodyRecord = payload as Record<string, unknown>;
    if ('message' in bodyRecord && bodyRecord.message !== undefined) {
        return unwrapMessagePayload(bodyRecord.message, depth + 1);
    }
    return payload;
}

const GENERIC_NEST_ERROR_STRINGS = new Set([
    'Bad Request',
    'Unauthorized',
    'Forbidden',
    'Not Found',
    'Conflict',
    'Internal Server Error',
]);

function messageFromPayload(payload: unknown): string | undefined {
    const unwrappedPayload = unwrapMessagePayload(payload);
    if (isString(unwrappedPayload) && unwrappedPayload.trim()) return unwrappedPayload;
    if (isStringArray(unwrappedPayload) && unwrappedPayload.length) return unwrappedPayload[0];
    if (Array.isArray(unwrappedPayload) && unwrappedPayload.length) {
        return firstReadableFromValidationList(unwrappedPayload);
    }
    return undefined;
}

export function extractFromResponseBody(responseBody: unknown): string | undefined {
    if (!responseBody || typeof responseBody !== 'object') return undefined;
    const bodyFields = responseBody as Record<string, unknown>;

    const errorField = bodyFields.error;
    if (isString(errorField) && errorField.trim() && !GENERIC_NEST_ERROR_STRINGS.has(errorField)) {
        return errorField;
    }
    if (isStringArray(errorField) && errorField.length) {
        return errorField[0];
    }
    if (Array.isArray(errorField) && errorField.length) {
        const fromList = firstReadableFromValidationList(errorField);
        if (fromList) return fromList;
    }

    if (errorField && typeof errorField === 'object' && !Array.isArray(errorField)) {
        const fromNestedError = messageFromPayload(errorField);
        if (fromNestedError) return fromNestedError;
    }

    const messageFromNestedBody = messageFromPayload(bodyFields.message);
    if (messageFromNestedBody) return messageFromNestedBody;

    return undefined;
}

function parseResponseData(data: unknown): unknown {
    if (typeof data === 'string') {
        const trimmed = data.trim();
        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return data;
        try {
            return JSON.parse(trimmed) as unknown;
        } catch {
            return data;
        }
    }
    return data;
}

function extractFromAxiosLikePayload(error: unknown): string | undefined {
    const err = error as { response?: { data?: unknown }; message?: unknown } | undefined;
    const rawData = err?.response?.data;
    const responseData = parseResponseData(rawData);

    if (responseData && typeof responseData === 'object') {
        const readableMessage = extractFromResponseBody(responseData);
        if (readableMessage) return readableMessage;
    }
    return undefined;
}

export function extractApiMessage(error: unknown): string {
    if (isString(error)) return error;

    const chain: unknown[] = [error];
    const withCause = error as { cause?: unknown };
    if (withCause?.cause !== undefined && withCause.cause !== error) {
        chain.push(withCause.cause);
    }

    for (const link of chain) {
        const fromBody = extractFromAxiosLikePayload(link);
        if (fromBody) return fromBody;
    }

    const axiosErrorLike = error as { message?: unknown } | undefined;
    if (isString(axiosErrorLike?.message)) return axiosErrorLike.message as string;

    return 'Erro ao processar solicitação.';
}

export function mapErrorToField(rawMessage: string): {
    field?: 'email' | 'password';
    message?: string;
} {
    const normalizedForMatch = rawMessage.toLowerCase();

    if (normalizedForMatch.includes('password') || normalizedForMatch.includes('senha')) {
        return { field: 'password', message: rawMessage };
    }

    if (normalizedForMatch.includes('email') || normalizedForMatch.includes('e-mail')) {
        return { field: 'email', message: rawMessage };
    }

    return { message: rawMessage };
}