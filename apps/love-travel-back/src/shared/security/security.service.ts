import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
    private readonly SALT_ROUNDS = 10;

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
        return await bcrypt.hash(password, salt);
    }
}