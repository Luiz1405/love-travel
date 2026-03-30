import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { ApiStandarErrors } from "./swagger.decorator";
import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";

export function AuthEndpoint() {
    return applyDecorators(
        UseGuards(JwtAuthGuard),
        ApiBearerAuth(),
        ApiStandarErrors(),
    )
}

export function AuthApiResponse(status: number, description: string) {
    return applyDecorators(
        AuthEndpoint(),
        ApiResponse({ status, description }),
    )
}