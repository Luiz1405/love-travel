import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";


export function ApiStandarErrors() {
    return applyDecorators(
        ApiResponse({ status: 401, description: 'Token inválido ou ausente.' }),
        ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' }),
        ApiResponse({ status: 500, description: 'Erro interno no servidor.' }),
        ApiResponse({ status: 403, description: 'Acesso não autorizado.' }),
        ApiResponse({ status: 404, description: 'Recurso não encontrado.' }),
        ApiResponse({ status: 409, description: 'Conflito de recursos.' }),
        ApiResponse({ status: 429, description: 'Muitas requisições.' }),
        ApiResponse({ status: 503, description: 'Serviço indisponível.' }),
        ApiResponse({ status: 504, description: 'Tempo limite da requisição excedido.' }),
    )
}