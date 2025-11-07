// app/unauthorized/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
    return (
        <div className="container text-center py-20 mx-auto">
            <h1 className="text-4xl font-bold text-destructive">Access Denied</h1>
            <p className="mt-4 text-muted-foreground">You do not have the necessary permissions to view this page.</p>
            <Button asChild className="mt-6"><Link href="/">Back to Home</Link></Button>
        </div>
    )
}