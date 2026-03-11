import { UploadFileInterface } from "./contracts/handleFileInterface";


export class handleFileSupaBaseService implements UploadFileInterface {

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const { data, error } = await supabase.storage
            .from('travels')
            .upload(file.originalname, file.buffer);

        if (error) {
            throw new Error('Error uploading file');
        }

        return data.path;
    }
}