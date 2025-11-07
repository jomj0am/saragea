// components/shared/FileUploader.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Loader2, UploadCloud, FileWarning } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { cn } from '@/lib/utils';

// --- REKEBISHO #1: Bainisha 'Types' Sahihi ---
// 'Type' kwa ajili ya matokeo tunayoyategemea kutoka Cloudinary
type CloudinaryUploadResult = {
    public_id: string;
    secure_url: string;
    original_filename: string;
    format: string;
    resource_type: string;
    // ... na fields nyingine nyingi ambazo Cloudinary inarudisha
};

// 'Type' kwa ajili ya 'props' za component yetu
interface FileUploaderProps {
    onUploadSuccess: (result: CloudinaryUploadResult) => void;
    folder?: string; // Fanya 'folder' iwe 'prop' ili component iwe 'reusable'
}

export default function FileUploader({ onUploadSuccess, folder = 'documents' }: FileUploaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        // --- REKEBISHO #2: Boresha 'Error Handling' ---
        // Shughulikia faili zilizokataliwa (k.m., sio picha)
        if (fileRejections.length > 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: `File '${fileRejections[0].file.name}' was rejected. Please upload a valid file.`,
            });
            return;
        }

        const file = acceptedFiles[0];
        if (!file) return;

        setIsLoading(true);
        try {
            // 1. Pata signature kutoka backend
            const sigResponse = await fetch('/api/upload-signature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder }), // Tumia 'folder' prop
            });
            if (!sigResponse.ok) throw new Error('Failed to get an upload signature from the server.');
            const { signature, timestamp } = await sigResponse.json();

            // 2. Tayarisha form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('folder', folder);

            // 3. Tuma faili kwenda Cloudinary
            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error.message || 'Cloudinary upload failed.');
            }
            
            // Tumia 'type' yetu hapa
            const result: CloudinaryUploadResult = await uploadResponse.json();

            // 4. Mpe mzazi taarifa
            onUploadSuccess(result);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: errorMessage,
            });
            console.error('Upload failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [onUploadSuccess, folder, toast]);
    
    // --- REKEBISHO #3: UI BORA ZAIDI ---
    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({ 
        onDrop, 
        multiple: false,
        // Bainisha aina za faili zinazoruhusiwa
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'application/pdf': [],
        }
    });

    return (
        <div 
            {...getRootProps()} 
            className={cn(
                "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
                isDragActive && "border-primary bg-primary/10",
                isDragReject && "border-destructive bg-destructive/10 text-destructive"
            )}
        >
            <input {...getInputProps()} />
            {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Uploading...</p>
                </div>
            ) : isDragReject ? (
                 <div className="flex flex-col items-center gap-2">
                    <FileWarning className="h-8 w-8" />
                    <p>Invalid file type</p>
                </div>
            ) : isDragActive ? (
                <div className="flex flex-col items-center gap-2">
                    <UploadCloud className="h-8 w-8 text-primary" />
                    <p>Drop the file here to upload</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <UploadCloud className="h-8 w-8" />
                    <p>Drag & drop a file here, or click to select</p>
                    <p className="text-xs text-muted-foreground">PDF, PNG, JPG accepted</p>
                </div>
            )}
        </div>
    );
}