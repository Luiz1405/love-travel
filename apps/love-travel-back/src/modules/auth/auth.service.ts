import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { UsersService } from "../users/services/users.service";
import { SecurityService } from "src/shared/security/security.service";
import { LoginDto } from "./dto/login.dto";
import { GoogleUserPayload } from "./types/google-user-payload";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly securityService: SecurityService,
        private readonly jwtService: JwtService
    ) { }

    async login(loginDto: LoginDto) {

        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);

        if (!user || !(await this.securityService.comparePassword(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email };

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    async googleLogin(googleUser: GoogleUserPayload) {
        let user = await this.usersService.findByEmail(googleUser.email);

        if (!user) {
            user = await this.usersService.createWithGoogle({
                email: googleUser.email,
                name: googleUser.name,
                avatar: googleUser.picture,
                provider: 'google',
            });
        }


        const payload = { sub: user.id, email: user.email };

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

}