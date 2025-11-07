// app/(main)/dashboard/documents/page.tsx
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DocumentUploader from '@/components/tenant/DocumentUploader';
import DocumentList from '@/components/tenant/DocumentList'; 
import { redirect } from 'next/navigation';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

async function getDocuments(userId: string) {
    return prisma.document.findMany({
        where: { tenantId: userId },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function DocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
    const resolvedParams = await params;
    const { locale } = resolvedParams;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect(`/${locale}/login?callbackUrl=/dashboard/documents`);
    }
    
    
    const documents = await getDocuments(session.user.id);

    return (
        <div className="container mx-auto px-4 py-12 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Your Documents</CardTitle>
                    <CardDescription>
                        Please upload necessary documents like your National ID or Passport.
                        These files are stored securely and are only accessible by the administration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DocumentUploader />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>My Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <DocumentList initialDocuments={documents} />
                </CardContent>
            </Card>
        </div>
    );
}