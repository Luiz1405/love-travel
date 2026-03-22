

export interface handleFileInterface {
    uploadFile(file: Express.Multer.File): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
    verifyFileType(file: Express.Multer.File): boolean;
    verifyFileSize(file: Express.Multer.File): boolean;
}