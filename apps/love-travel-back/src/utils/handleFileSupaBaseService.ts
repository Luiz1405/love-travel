/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable, Inject, Logger, BadGatewayException } from "@nestjs/common";
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
        const mask = (s?: string) => s ? `${s.slice(0, 6)}...${s.slice(-4)}` : 'undefined';
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_KEY;
        const bucket = process.env.SUPABASE_BUCKET;
        if (!file || !file.buffer || !file.originalname) {
            throw new Error('Invalid file provided');
        }

        try {
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
        } catch (err: any) {

            const causeMsg = err?.cause?.message || err?.cause || '';
            const code = err?.code || err?.cause?.code || '';
            const isNetwork =
                /ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|fetch failed|network/i.test(`${err?.message} ${causeMsg} ${code}`);

            console.error('Supabase upload failed', {
                message: err?.message,
                code,
                cause: causeMsg,
                stack: err?.stack,
                supabase: { url, key: mask(key), bucket },
            });

            if (isNetwork) {
                throw new BadGatewayException(
                    'Falha ao conectar ao serviço de arquivos. Tente novamente mais tarde.'
                );
            }

            throw new BadGatewayException(
                err?.message || 'Erro ao enviar arquivo para o armazenamento.'
            );
        }
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