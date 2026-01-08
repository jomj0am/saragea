// components/admin/MultiImageUploader.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud, X } from "lucide-react";
import { useToast } from "../../ui/use-toast";
import Image from "next/image";

interface MultiImageUploaderProps {
  value: string[]; // Tunategemea prop hii iwe array ya strings
  onChange: (value: string[]) => void;
}

export default function MultiImageUploader({
  value,
  onChange,
}: MultiImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsLoading(true);
      const uploadedUrls: string[] = [];

      for (const file of acceptedFiles) {
        try {
          const folderName = "properties";

          // 1. Get Signature AND the correct keys from our own API
          const sigResponse = await fetch("/api/upload-signature", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: folderName }),
          });

          if (!sigResponse.ok) {
            const errData = await sigResponse.json();
            throw new Error(errData.message || "Failed to get signature");
          }

          // ✅ Get everything from the response
          const { signature, timestamp, apiKey, cloudName } =
            await sigResponse.json();

          // 2. Prepare Form Data
          const formData = new FormData();
          formData.append("file", file);

          // ✅ Use the apiKey provided by the server, NOT from process.env
          formData.append("api_key", apiKey);
          formData.append("signature", signature);
          formData.append("timestamp", String(timestamp));
          formData.append("folder", folderName);

          // 3. Upload to Cloudinary using the cloudName from our API
          const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: formData }
          );

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(
              errorData.error?.message || "Cloudinary upload failed."
            );
          }

          const result = await uploadResponse.json();
          uploadedUrls.push(result.secure_url);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Upload failed. Please try again.";

          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: message,
          });
        }
      }

      const currentValue = Array.isArray(value) ? value : [];
      onChange([...currentValue, ...uploadedUrls]);
      setIsLoading(false);
    },
    [value, onChange, toast]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: { "image/*": [] },
  });

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  // --- REKEBISHO MUHIMU LIKO HAPA ---
  // Chuja 'array' ya 'value' ili kuondoa 'strings' tupu au 'falsy values' nyingine
  const validImages = Array.isArray(value) ? value.filter((url) => !!url) : [];

  return (
    <div>
      {/* Preview Grid */}
      {validImages.length > 0 && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tumia 'index' kwa ajili ya 'key' ili kuhakikisha ni ya kipekee */}
          {validImages.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square group"
            >
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
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-muted transition-colors"
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="h-8 w-8" />
            <p>Drag & drop images here, or click to select</p>
          </div>
        )}
      </div>
    </div>
  );
}
