import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';


export function PhotoDropzone({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
    const [localFiles, setLocalFiles] = useState<File[]>([]);
    const onDrop = useCallback((accepted: File[]) => {
        setLocalFiles((prev) => {
            const existing = new Set(prev.map((f) => `${f.name}-${f.size}-${(f as any).lastModified}`));
            const merged = [...prev, ...accepted.filter((f) => !existing.has(`${f.name}-${f.size}-${(f as any).lastModified}`))];
            onFilesSelected(merged);
            return merged;
        });
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
    });

    return (
        <div
            {...getRootProps()}
            className={`rounded-lg border-2 border-dashed p-8 text-center ${isDragActive ? 'border-sky-400 bg-sky-50' : 'border-slate-200'
                }`}
        >
            <input {...getInputProps()} />
            <div className="text-slate-500 text-sm">
                Arraste e solte as imagens aqui ou <span className="text-sky-600 font-medium">clique para selecionar</span>
            </div>

            {localFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {localFiles.map((f) => (
                        <div key={`${f.name}-${f.size}-${(f as any).lastModified ?? ''}`} className="text-xs text-slate-600 truncate">{f.name}</div>
                    ))}
                </div>
            )}
        </div>
    );
}