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

function messageFromPayload(payload: unknown): string | undefined {
    const unwrappedPayload = unwrapMessagePayload(payload);
    if (isString(unwrappedPayload) && unwrappedPayload.trim()) return unwrappedPayload;
    if (isStringArray(unwrappedPayload) && unwrappedPayload.length) return unwrappedPayload[0];
    if (Array.isArray(unwrappedPayload) && unwrappedPayload.length) {
        const firstListItem = unwrappedPayload[0];
        if (isString(firstListItem)) return firstListItem;
        return firstConstraintMessage(firstListItem);
    }
    return undefined;
}

export function extractFromResponseBody(responseBody: unknown): string | undefined {
    if (!responseBody || typeof responseBody !== 'object') return undefined;
    const bodyFields = responseBody as Record<string, unknown>;

    const errorField = bodyFields.error;
    if (isString(errorField) && errorField.trim() && errorField !== 'Bad Request') {
        return errorField;
    }
    if (isStringArray(errorField) && errorField.length) {
        return errorField[0];
    }
    if (Array.isArray(errorField) && errorField.length) {
        const firstErrorItem = errorField[0];
        if (isString(firstErrorItem)) return firstErrorItem;
        const messageFromValidation = firstConstraintMessage(firstErrorItem);
        if (messageFromValidation) return messageFromValidation;
    }

    const messageFromNestedBody = messageFromPayload(bodyFields.message);
    if (messageFromNestedBody) return messageFromNestedBody;

    return undefined;
}

export function extractApiMessage(error: unknown): string {
    if (isString(error)) return error;
    const axiosErrorLike = error as { response?: { data?: unknown }; message?: unknown } | undefined;
    const responseData = axiosErrorLike?.response?.data as unknown;

    if (responseData && typeof responseData === 'object') {
        const readableMessage = extractFromResponseBody(responseData);
        if (readableMessage) return readableMessage;
    }
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