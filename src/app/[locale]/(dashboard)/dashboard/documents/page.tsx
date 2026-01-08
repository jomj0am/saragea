import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import DocumentUploader from "@/components/tenant/DocumentUploader";
import DocumentList from "@/components/tenant/DocumentList";
import { FileText, ShieldCheck } from "lucide-react";

async function getDocuments(userId: string) {
  return prisma.document.findMany({
    where: { tenantId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/${locale}/login?callbackUrl=/dashboard/documents`);
  }

  const documents = await getDocuments(session.user.id);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            My Documents
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Securely manage your lease agreements, identification, and other
            important files.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          Encrypted Storage
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Upload Section (Sticky on desktop) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <DocumentUploader />
          </div>
        </div>

        {/* Right: File List */}
        <div className="lg:col-span-2">
          <DocumentList initialDocuments={documents} />
        </div>
      </div>
    </div>
  );
}
