

export interface handleFileInterface {
    uploadFile(file: Express.Multer.File): Promise<string>;
}