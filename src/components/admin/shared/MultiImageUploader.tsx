// components/admin/MultiImageUploader.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { useToast } from '../../ui/use-toast';
import Image from 'next/image';

interface MultiImageUploaderProps {
    value: string[]; // Tunategemea prop hii iwe array ya strings
    onChange: (value: string[]) => void;
}

export default function MultiImageUploader({ value, onChange }: MultiImageUploaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsLoading(true);
        const uploadedUrls: string[] = [];

        for (const file of acceptedFiles) {
            try {
                const sigResponse = await fetch('/api/upload-signature', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folder: 'properties' }) 
                });
                if (!sigResponse.ok) throw new Error('Failed to get upload signature.');
                const { signature, timestamp } = await sigResponse.json();
                
                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
                formData.append('signature', signature);
                formData.append('timestamp', timestamp);
                formData.append('folder', 'properties');

                const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) throw new Error('Cloudinary upload failed.');
                const result = await uploadResponse.json();
                uploadedUrls.push(result.secure_url);

            } catch (error: unknown) {
                    let message = 'Something went wrong';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
                toast({ variant: 'destructive', title: 'Upload Failed', description: message || `Could not upload ${file.name}.` });
            }
        }
        
        // Hakikisha 'value' ni array kabla ya ku-spread
        const currentValue = Array.isArray(value) ? value : [];
        onChange([...currentValue, ...uploadedUrls]);
        setIsLoading(false);
    }, [value, onChange, toast]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: true, accept: { 'image/*': [] } });

    const handleRemove = (urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove));
    };
    
    // --- REKEBISHO MUHIMU LIKO HAPA ---
    // Chuja 'array' ya 'value' ili kuondoa 'strings' tupu au 'falsy values' nyingine
    const validImages = Array.isArray(value) ? value.filter(url => !!url) : [];

    return (
        <div>
            {/* Preview Grid */}
            {validImages.length > 0 && (
                <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Tumia 'index' kwa ajili ya 'key' ili kuhakikisha ni ya kipekee */}
                    {validImages.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative aspect-square group">
                            <Image 
                                src={url} 
                                alt={`Uploaded image ${index + 1}`} 
                                fill 
                                className="object-cover rounded-md" 
                            />
                            <button 
                                type="button" // Muhimu ili isifanye form i-submit
                                onClick={() => handleRemove(url)} 
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Dropzone */}
            <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-muted transition-colors">
                <input {...getInputProps()} />
                {isLoading ? (
                    <div className="flex flex-col items-center gap-2"><Loader2 className="h-8 w-8 animate-spin" /><p>Uploading...</p></div>
                ) : (
                    <div className="flex flex-col items-center gap-2"><UploadCloud className="h-8 w-8" /><p>Drag & drop images here, or click to select</p></div>
                )}
            </div>
        </div>
    );
}