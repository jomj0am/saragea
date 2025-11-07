// components/tenant/DocumentList.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Document } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function DocumentList({ initialDocuments }: { initialDocuments: Document[] }) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const handleDelete = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        setDeletingId(docId);
        try {
            await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
            toast({ title: 'Document deleted.' });
            router.refresh();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the document.' });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader><TableRow><TableHead>File Name</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {initialDocuments.length > 0 ? initialDocuments.map(doc => (
                        <TableRow key={doc.id}>
                            <TableCell>{doc.name}</TableCell>
                            <TableCell>{doc.type.replace('_', ' ')}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={doc.url} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" /> Download</Link>
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)} disabled={deletingId === doc.id}>
                                    {deletingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : <TableRow><TableCell colSpan={3} className="h-24 text-center">No documents uploaded yet.</TableCell></TableRow>}
                </TableBody>
            </Table>
        </div>
    );
}