/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { supabase } from "src/config/supabase.config";
import { handleFileInterface } from "./contracts/handleFileInterface";


export class HandleFileSupaBaseService implements handleFileInterface {

    async uploadFile(file: Express.Multer.File): Promise<string> {
        if (!file || !file.buffer || !file.originalname) {
            throw new Error('Invalid file provided');
        }

        const fileName = file.originalname;
        const fileBuffer = file.buffer;
        const contentType = file.mimetype || 'application/octet-stream';

        const { data, error } = await supabase.storage
            .from('travels')
            .upload(fileName, fileBuffer, {
                contentType: contentType,
                upsert: true
            });

        if (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Error uploading file: ${errorMessage}`);
        }

        if (!data || !data.path) {
            throw new Error('Upload succeeded but no path returned');
        }

        return data.path;
    }
}