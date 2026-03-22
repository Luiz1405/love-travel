/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable, Inject, Logger } from "@nestjs/common";
import { handleFileInterface } from "./contracts/handleFileInterface";
import { SupabaseService } from "src/config/supabase.config";

@Injectable()
export class HandleFileSupaBaseService implements handleFileInterface {
    constructor(
        @Inject(SupabaseService)
        private readonly supabaseService: SupabaseService,
        private readonly logger: Logger
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

    async deleteFile(fileUrl: string): Promise<void> {
        const bucketName = 'travels';
        try {

            const relativePath = fileUrl.split(`public/${bucketName}`)[1];

            if (!relativePath) {
                throw new Error('Invalid URL');
            }

            const filePath = decodeURIComponent(relativePath);


            const supabase = this.supabaseService.getClient();
            const { error } = await supabase.storage
                .from(bucketName)
                .remove([filePath]);

            if (error) {
                throw error;
            }

        } catch (error) {
            this.logger.error(`Error deleting file: ${fileUrl}`);
            throw error;
        }
    }

    verifyFileType(file: Express.Multer.File): boolean {
        return file.mimetype.startsWith('image/');
    }

    verifyFileSize(file: Express.Multer.File): boolean {
        return file.size <= 10 * 1024 * 1024; // 10MB
    }
}