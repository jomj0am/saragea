"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Document } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Download,
  Trash2,
  Loader2,
  FileText,
  FileImage,
  File,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const getFileIcon = (type: string) => {
  // Basic heuristic based on type name or file extension if available
  // For now, we use the enum type
  if (type.includes("ID") || type.includes("PASSPORT"))
    return <FileImage className="w-5 h-5 text-orange-500" />;
  if (type.includes("LEASE"))
    return <FileText className="w-5 h-5 text-blue-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
};

export default function DocumentList({
  initialDocuments,
}: {
  initialDocuments: Document[];
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setDeletingId(docId);
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      toast({ title: "Document deleted." });
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the document.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {initialDocuments.length > 0 ? (
        <div className="grid gap-4">
          {initialDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3 bg-secondary rounded-xl group-hover:bg-primary/10 transition-colors">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold truncate pr-4 text-sm md:text-base">
                      {doc.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal uppercase tracking-wider"
                      >
                        {doc.type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        • {format(new Date(doc.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Link
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="h-9 w-9 rounded-full hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <File className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="font-semibold text-lg">No documents yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Upload your ID, passport, or lease agreement to keep them safe and
              accessible.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
