import { describe, expect, it } from 'vitest';

import { toErrorMessage } from './error';

describe('toErrorMessage', () => {
    const fallback = 'fallback-msg';

    it('retorna string aparada ou o fallback quando vazia', () => {
        expect(toErrorMessage('  ok  ', fallback)).toBe('ok');
        expect(toErrorMessage('', fallback)).toBe(fallback);
        expect(toErrorMessage('   ', fallback)).toBe(fallback);
    });

    it('retorna a primeira string encontrada em array', () => {
        expect(toErrorMessage(['primeiro', 'segundo'], fallback)).toBe('primeiro');
    });

    it('concatena strings do array quando a primeira string é vazia após trim implícito na checagem', () => {
        expect(toErrorMessage(['', 'linha'], fallback)).toBe('linha');
    });

    it('usa fallback quando o array não produz texto', () => {
        expect(toErrorMessage([1, 2] as unknown[], fallback)).toBe(fallback);
    });

    it('percorre message aninhado e lê error string', () => {
        expect(toErrorMessage({ message: { message: 'interno' } }, fallback)).toBe('interno');
        expect(toErrorMessage({ error: '  err  ' }, fallback)).toBe('  err  ');
    });

    it('usa fallback para objeto sem message útil', () => {
        expect(toErrorMessage({ message: undefined }, fallback)).toBe(fallback);
        expect(toErrorMessage({}, fallback)).toBe(fallback);
        expect(toErrorMessage({ error: '   ' }, fallback)).toBe(fallback);
    });

    it('recursão em message que não é string resolve para fallback', () => {
        expect(toErrorMessage({ message: 42 }, fallback)).toBe(fallback);
    });

    it('usa fallback para null, número e tipos primitivos fora string/array', () => {
        expect(toErrorMessage(null, fallback)).toBe(fallback);
        expect(toErrorMessage(undefined, fallback)).toBe(fallback);
        expect(toErrorMessage(42, fallback)).toBe(fallback);
    });
});
