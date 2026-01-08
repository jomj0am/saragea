"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import FileUploader from "@/components/shared/FileUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  original_filename: string;
};

export default function DocumentUploader() {
  const [documentType, setDocumentType] = useState<DocumentType>("ID_CARD");
  const router = useRouter();
  const { toast } = useToast();

  const handleUploadSuccess = async (result: CloudinaryUploadResult) => {
    if (!result.public_id || !result.secure_url || !result.original_filename) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Incomplete file data. Please try again.",
      });
      return;
    }

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.original_filename,
          type: documentType,
          url: result.secure_url,
          publicId: result.public_id,
        }),
      });
      if (!response.ok) throw new Error("Failed to save document.");

      toast({
        title: "Upload Complete",
        description: "Your document has been securely saved.",
      });
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save the document record.",
      });
    }
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-900/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UploadCloud className="w-5 h-5 text-blue-500" />
          Upload New File
        </CardTitle>
        <CardDescription>
          Select the document type and drag your file below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="doc-type"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Document Type
          </Label>
          <Select
            value={documentType}
            onValueChange={(value: DocumentType) => setDocumentType(value)}
          >
            <SelectTrigger id="doc-type" className="bg-background">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.values(DocumentType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FileUploader onUploadSuccess={handleUploadSuccess} />

        <p className="text-[10px] text-center text-muted-foreground">
          Supported formats: PDF, JPG, PNG. Max size: 10MB.
        </p>
      </CardContent>
    </Card>
  );
}
