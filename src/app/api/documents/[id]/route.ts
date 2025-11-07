// app/[locale]/api/documents/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * DELETE a document record from the database and the file from Cloudinary.
 * Access is restricted to the document owner or an administrator.
 */
export async function DELETE(
    request: NextRequest,
    context: unknown // <<<--- REKEBISHO #1: Tumia 'unknown' badala ya 'any'
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        // --- REKEBISHO #2: Fanya 'Type Guarding' ---
        // Hii ni njia salama na sahihi ya kushughulikia 'unknown' type
        const contextAsParams = context as { params: { id: string } };
        if (!contextAsParams?.params?.id) {
            return NextResponse.json({ message: 'Document ID is missing from URL' }, { status: 400 });
        }
        const documentId = contextAsParams.params.id;
        
        // ... (Logic yako yote iliyobaki inabaki kama ilivyo)
        const document = await prisma.document.findUnique({ 
            where: { id: documentId },
        });

        if (!document) {
            return NextResponse.json({ message: 'Document not found' }, { status: 404 });
        }

        const isOwner = document.tenantId === session.user.id;
        const isAdmin = session.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        await cloudinary.uploader.destroy(document.publicId);
        await prisma.document.delete({ where: { id: documentId } });

        return NextResponse.json({ message: 'Document deleted successfully' });
        
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Failed to delete document:", error);
        return NextResponse.json({ message: `Failed to delete document: ${errorMessage}` }, { status: 500 });
    }
}