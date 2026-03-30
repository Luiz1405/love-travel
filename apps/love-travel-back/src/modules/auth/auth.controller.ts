import { AuthService } from "./auth.service";
import { Body, Controller, Post, HttpCode, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import { LoginDto } from "./dto/login.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiResponse } from "@nestjs/swagger";
import { ApiStandarErrors } from "src/utils/decorators/swagger.decorator";
import type { Request, Response } from "express";
import { GoogleUserPayload } from "./types/google-user-payload";
import { UpdatePasswordDto } from "./dto/update-password.dto";

interface GoogleAuthRequest extends Request {
    user: GoogleUserPayload;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiResponse({ status: 302, description: 'Autenticação com Google realizada com sucesso.' })
    @ApiStandarErrors()
    googleAuth() { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiResponse({ status: 200, description: 'Autenticação com Google realizada com sucesso.' })
    @ApiStandarErrors()
    async googleAuthRedirect(@Req() req: GoogleAuthRequest, @Res() res: Response) {
        const resultToken = await this.authService.googleLogin(req.user);
        res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${resultToken.access_token}`);
    }

    @Post('forgot-password')
    @ApiResponse({ status: 200, description: 'Senha atualizada com sucesso.' })
    @ApiStandarErrors()
    async forgetPassword(@Body() updatePasswordDto: UpdatePasswordDto) {
        return this.authService.forgotPassword(updatePasswordDto);
    }
}