import { describe, expect, it } from 'vitest';

import { extractApiMessage, extractFromResponseBody, mapErrorToField } from './extract-api-message';

function axiosLike(responseData: unknown, axiosMessage = 'Request failed with status code 400') {
    return {
        message: axiosMessage,
        response: { data: responseData },
    };
}

describe('extractApiMessage', () => {
    it('retorna o próprio valor quando o erro já é string', () => {
        expect(extractApiMessage('erro direto')).toBe('erro direto');
    });

    it('prioriza message quando error é Unauthorized (login inválido)', () => {
        const data = {
            statusCode: 401,
            message: 'Invalid credentials',
            error: 'Unauthorized',
        };
        expect(extractApiMessage(axiosLike(data))).toBe('Invalid credentials');
    });

    it('lê string em error quando não é o rótulo genérico Bad Request', () => {
        const data = {
            statusCode: 400,
            message: { message: 'nested', error: 'Bad Request', statusCode: 400 },
            error: 'Data de término deve ser depois da Data de início',
        };
        expect(extractApiMessage(axiosLike(data))).toBe('Data de término deve ser depois da Data de início');
    });

    it('ignora error igual a Bad Request e segue para message aninhado', () => {
        const data = {
            statusCode: 400,
            message: {
                message: 'Mensagem real',
                error: 'Bad Request',
                statusCode: 400,
            },
            error: 'Bad Request',
        };
        expect(extractApiMessage(axiosLike(data))).toBe('Mensagem real');
    });

    it('lê array de strings em error', () => {
        const data = { error: ['primeiro erro', 'outro'] };
        expect(extractApiMessage(axiosLike(data))).toBe('primeiro erro');
    });

    it('lê primeiro texto de constraints em error como array de ValidationError', () => {
        const data = {
            error: [
                {
                    property: 'endDate',
                    constraints: { isAfter: 'Data de término deve ser depois da Data de início' },
                },
            ],
        };
        expect(extractApiMessage(axiosLike(data))).toBe('Data de término deve ser depois da Data de início');
    });

    it('lê constraints no segundo item quando o primeiro não tem texto', () => {
        const data = {
            error: [{ property: 'x', constraints: {} }, { constraints: { isPositive: 'Total gasto deve ser positivo.' } }],
        };
        expect(extractApiMessage(axiosLike(data))).toBe('Total gasto deve ser positivo.');
    });

    it('lê validação quando error é objeto Nest (corpo sem message no topo)', () => {
        const nestBody = {
            message: [{ property: 'total_spent', constraints: { isPositive: 'Total gasto deve ser um número positivo ou maior que 0.' } }],
            error: 'Bad Request',
            statusCode: 400,
        };
        const data = { statusCode: 400, error: nestBody };
        expect(extractApiMessage(axiosLike(data))).toBe('Total gasto deve ser um número positivo ou maior que 0.');
    });

    it('interpreta response.data como JSON em string', () => {
        const inner = JSON.stringify({
            statusCode: 400,
            error: [{ constraints: { isAfter: 'Data de término deve ser depois da Data de início' } }],
        });
        const err = { message: 'Request failed with status code 400', response: { data: inner } };
        expect(extractApiMessage(err)).toBe('Data de término deve ser depois da Data de início');
    });

    it('lê corpo em error.cause quando o erro foi encapsulado', () => {
        const data = {
            error: [{ constraints: { isPositive: 'Valor inválido.' } }],
        };
        const axiosErr = axiosLike(data);
        const wrapped = { cause: axiosErr, message: 'wrapped' };
        expect(extractApiMessage(wrapped)).toBe('Valor inválido.');
    });

    it('lê primeiro item string em error misto', () => {
        const data = { error: ['apenas texto'] };
        expect(extractApiMessage(axiosLike(data))).toBe('apenas texto');
    });

    it('percorre children em ValidationError quando constraints não têm string', () => {
        const data = {
            error: [
                {
                    constraints: { x: 123 as unknown as string },
                    children: [{ constraints: { isAfter: 'falha no filho' } }],
                },
            ],
        };
        expect(extractApiMessage(axiosLike(data))).toBe('falha no filho');
    });

    it('desembrulha message aninhado até string', () => {
        const data = {
            message: {
                message: {
                    message: 'texto final',
                    error: 'Bad Request',
                    statusCode: 400,
                },
                statusCode: 400,
            },
        };
        expect(extractApiMessage(axiosLike(data))).toBe('texto final');
    });

    it('lê primeiro item de message como array de strings', () => {
        const data = { message: ['a', 'b'] };
        expect(extractApiMessage(axiosLike(data))).toBe('a');
    });

    it('lê string na primeira posição quando message é array misto', () => {
        expect(extractApiMessage(axiosLike({ message: ['vis', 3] }))).toBe('vis');
    });

    it('retorna axios quando message é array vazio após unwrap', () => {
        expect(extractApiMessage(axiosLike({ message: [] }))).toBe('Request failed with status code 400');
    });

    it('retorna axios quando message é string só com espaços', () => {
        expect(extractApiMessage(axiosLike({ message: '   ' }))).toBe('Request failed with status code 400');
    });

    it('lê constraints a partir de message como array de objetos', () => {
        const data = {
            message: [{ constraints: { custom: 'validação falhou' } }],
        };
        expect(extractApiMessage(axiosLike(data))).toBe('validação falhou');
    });

    it('retorna undefined internamente vira fallback quando response é objeto vazio', () => {
        const err = axiosLike({});
        expect(extractApiMessage(err)).toBe('Request failed with status code 400');
    });

    it('usa mensagem padrão quando não há response nem string', () => {
        expect(extractApiMessage({})).toBe('Erro ao processar solicitação.');
    });

    it('usa mensagem padrão quando response.data não é objeto', () => {
        expect(extractApiMessage({ response: { data: null } })).toBe('Erro ao processar solicitação.');
    });

    it('retorna axios quando message não contém string nem validação reconhecível', () => {
        const err = axiosLike({ message: { foo: 1 } });
        expect(extractApiMessage(err)).toBe('Request failed with status code 400');
    });

    it('retorna axios quando lista de validação não tem constraints com texto', () => {
        const err = axiosLike({
            message: [{ children: [{ constraints: {} }], constraints: {} }],
        });
        expect(extractApiMessage(err)).toBe('Request failed with status code 400');
    });

    it('error como array misto com string na primeira posição usa branch de string do item', () => {
        expect(extractApiMessage(axiosLike({ error: ['visível', 2] }))).toBe('visível');
    });

    it('error como array com primeiro item não-string cai em validação vazia', () => {
        expect(extractApiMessage(axiosLike({ error: [null] }))).toBe('Request failed with status code 400');
    });

    it('constraints presente mas não-objeto é ignorado até esgotar children', () => {
        const err = axiosLike({
            message: [{ constraints: 1 as unknown as Record<string, string>, children: [] }],
        });
        expect(extractApiMessage(err)).toBe('Request failed with status code 400');
    });

    it('percorre vários children até achar o primeiro com mensagem', () => {
        const err = axiosLike({
            message: [
                {
                    children: [{}, { constraints: { z: 'achou' } }],
                },
            ],
        });
        expect(extractApiMessage(err)).toBe('achou');
    });

    it('para desembrulhamento após profundidade máxima mantendo objeto sem extrair string', () => {
        let payload: Record<string, unknown> = { message: 'fundo' };
        for (let i = 0; i < 10; i++) {
            payload = { message: payload };
        }
        const err = axiosLike({ message: payload });
        expect(extractApiMessage(err)).toBe('Request failed with status code 400');
    });
});

describe('extractFromResponseBody', () => {
    it('retorna undefined para corpo ausente ou não-objeto', () => {
        expect(extractFromResponseBody(null)).toBeUndefined();
        expect(extractFromResponseBody(undefined)).toBeUndefined();
        expect(extractFromResponseBody(0)).toBeUndefined();
        expect(extractFromResponseBody('texto')).toBeUndefined();
        expect(extractFromResponseBody(Symbol('x'))).toBeUndefined();
    });

    it('processa objeto vazio como corpo válido', () => {
        expect(extractFromResponseBody({})).toBeUndefined();
    });
});

describe('mapErrorToField', () => {
    it('mapeia senha', () => {
        expect(mapErrorToField('Invalid password')).toEqual({
            field: 'password',
            message: 'Invalid password',
        });
        expect(mapErrorToField('senha fraca')).toEqual({
            field: 'password',
            message: 'senha fraca',
        });
    });

    it('mapeia email', () => {
        expect(mapErrorToField('Bad email')).toEqual({
            field: 'email',
            message: 'Bad email',
        });
        expect(mapErrorToField('e-mail inválido')).toEqual({
            field: 'email',
            message: 'e-mail inválido',
        });
    });

    it('retorna apenas message quando não há palavra-chave conhecida', () => {
        expect(mapErrorToField('outro')).toEqual({ message: 'outro' });
    });
});
