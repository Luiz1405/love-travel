import { supabase } from "../../services/supabase";


export const uploadTravelImage = async (file: File, userId: string): Promise<string> => {
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${userId}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('travels')
            .upload(filePath, file);


        if (error) {
            console.error('SupaBase Error:', error.message);
            throw new Error(`Failed to upload file: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('travels')
            .getPublicUrl(filePath);

        return publicUrl;

    } catch (error) {
        console.error('Error uploading travel image:', error);
        throw error;
    }
}