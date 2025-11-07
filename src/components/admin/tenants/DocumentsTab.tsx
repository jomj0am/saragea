// components/admin/tenants/DocumentsTab.tsx
import { type FullTenantDetails } from "@/app/[locale]/(admin)/admin/tenants/[id]/page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Nodata } from "@/components/shared/Nodata";

// 'Props' zinapokea 'documents' array kutoka 'FullTenantDetails' type
type DocumentsTabProps = {
    documents: FullTenantDetails['documents'];
}

export default function DocumentsTab({ documents }: DocumentsTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>
                    All documents uploaded by the tenant for verification and record-keeping.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Document Type</TableHead>
                                <TableHead>Upload Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.length > 0 ? (
                                documents.map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {doc.name}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {doc.type.replace('_', ' ').toLowerCase()}
                                        </TableCell>
                                        <TableCell>{format(doc.createdAt, 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center">
                                        <Nodata />
                                        <p className="mt-4 font-semibold">No Documents Uploaded</p>
                                        <p className="text-sm text-muted-foreground">The tenant has not uploaded any documents yet.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}