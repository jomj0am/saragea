// components/tenant/DocumentUploader.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import FileUploader from '@/components/shared/FileUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DocumentType } from '@prisma/client'; // Import enum kutoka Prisma

// 'Type' kwa ajili ya matokeo ya Cloudinary
type CloudinaryUploadResult = {
    public_id: string;
    secure_url: string;
    original_filename: string;
};

export default function DocumentUploader() {
    // Tumia 'enum' yetu ya Prisma kwa 'type safety'
    const [documentType, setDocumentType] = useState<DocumentType>('ID_CARD');
    const router = useRouter();
    const { toast } = useToast();

    // --- REKEBISHO MUHIMU LIKO HAPA ---
    // Sasa 'result' ina 'type' sahihi, hakuna tena 'any'
    const handleUploadSuccess = async (result: CloudinaryUploadResult) => {
        // Ulinzi wa ziada: Hakikisha 'result' object ina 'properties' tunazohitaji
        if (!result.public_id || !result.secure_url || !result.original_filename) {
            toast({
                variant: 'destructive',
                title: 'Upload Error',
                description: 'The uploaded file information is incomplete. Please try again.',
            });
            return;
        }

        try {
            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: result.original_filename,
                    type: documentType,
                    url: result.secure_url,
                    publicId: result.public_id,
                }),
            });
            if (!response.ok) throw new Error('Failed to save document record.');

            toast({ title: "Success!", description: "Your document has been uploaded." });
            router.refresh();

        } catch  {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the document.' });
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="doc-type">Select Document Type</Label>
                {/* Tumia 'onValueChange' na type casting sahihi */}
                <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
                    <SelectTrigger id="doc-type">
                        <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Tumia 'Object.values' ili kuepuka kuandika majina kwa mkono */}
                        {Object.values(DocumentType).map((type) => (
                            <SelectItem key={type} value={type}>
                                {type.replace('_', ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <FileUploader onUploadSuccess={handleUploadSuccess} />
        </div>
    );
}