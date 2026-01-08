"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type ExportableRow = Record<string, unknown>;

interface ExportButtonProps<T extends ExportableRow> {
  data: T[];
  filename?: string;
}

export default function ExportButton<T extends ExportableRow>({
  data,
  filename = "export.csv",
}: ExportButtonProps<T>) {
  const handleExport = () => {
    if (!data.length) return;

    // 1. Extract headers
    const headers = Object.keys(data[0]);

    // 2. Convert to CSV
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((field) => {
            const value = row[field];

            if (value === null || value === undefined) return "";

            if (typeof value === "string") {
              if (value.includes(",") || value.includes('"')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            }

            if (typeof value === "number" || typeof value === "boolean") {
              return String(value);
            }

            try {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            } catch {
              return "";
            }
          })
          .join(",")
      ),
    ].join("\n");

    // 3. Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
