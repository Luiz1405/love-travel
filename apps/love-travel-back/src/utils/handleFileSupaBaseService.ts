/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable, Inject } from "@nestjs/common";
import { handleFileInterface } from "./contracts/handleFileInterface";
import { SupabaseService } from "src/config/supabase.config";

@Injectable()
export class HandleFileSupaBaseService implements handleFileInterface {
    constructor(
        @Inject(SupabaseService)
        private readonly supabaseService: SupabaseService
    ) { }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        if (!file || !file.buffer || !file.originalname) {
            throw new Error('Invalid file provided');
        }

        const supabase = this.supabaseService.getClient();
        const fileName = file.originalname;
        const fileBuffer = file.buffer;
        const contentType = file.mimetype || 'application/octet-stream';

        const { error } = await supabase.storage
            .from('travels')
            .upload(fileName, fileBuffer, {
                contentType: contentType,
                upsert: true
            });

        const { data: publicUrlData } = supabase.storage
            .from('travels')
            .getPublicUrl(fileName);


        if (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Error uploading file: ${errorMessage}`);
        }

        return publicUrlData.publicUrl;
    }
}