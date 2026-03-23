import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile } from "passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { GoogleUserPayload } from "./types/google-user-payload";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
            scope: ['email', 'profile']
        });
    }

    validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ): void {
        const user: GoogleUserPayload = {
            email: profile.emails?.[0]?.value ?? '',
            name: profile.displayName ?? '',
            picture: profile.photos?.[0]?.value ?? '',
        };
        done(null, user);
    }

}