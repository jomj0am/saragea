// app/[locale]/(admin)/admin/tenants/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail,  Home, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
// Tutatengeneza hizi komponenti
import LeaseDetailsTab from "@/components/admin/tenants/LeaseDetailsTab";
import DocumentsTab from "@/components/admin/tenants/DocumentsTab";
import MaintenanceTab from "@/components/admin/tenants/MaintenanceTab";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";



// 'Type' kamili ya data ya mpangaji
export type FullTenantDetails = Prisma.UserGetPayload<{
    include: {
        leases: {
            include: {
                room: { include: { property: true } },
                invoices: { 
                    orderBy: { dueDate: 'desc' },
                    include: { payment: true }
                },
            },
            orderBy: { startDate: 'desc' },
        },
        documents: { orderBy: { createdAt: 'desc' } },
        maintenanceTickets: { orderBy: { createdAt: 'desc' } },
    }
}>;

// 'Function' ya kupata data
async function getTenantDetails(id: string): Promise<FullTenantDetails | null> {
  return prisma.user.findUnique({
    where: { id, role: 'TENANT' }, // Hakikisha ni mpangaji
    include: {
      leases: {
        include: {
          room: { include: { property: true } },
          invoices: {
            orderBy: { dueDate: 'desc' },
            include: { payment: true },
          },
        },
        orderBy: { startDate: 'desc' },
      },
      documents: { orderBy: { createdAt: 'desc' } },
      maintenanceTickets: { orderBy: { createdAt: 'desc' } },
    },
  });
}

interface LocaleLayoutProps {
  params: Promise<{ id: string }>; 
}
export default async function TenantProfilePage({ params }: LocaleLayoutProps ) {
        const awaitedParams = await params; 

    const [tenant] = await Promise.all([
        getTenantDetails(awaitedParams.id),
        getServerSession(authOptions)
    ]);
    
    if (!tenant) {
        notFound();
    }
    
    const activeLease = tenant.leases.find(l => l.isActive);

    return (
        <div className="space-y-8">
            {/* Header ya Profile */}
            <header className="flex flex-col sm:flex-row gap-6 p-6 bg-card rounded-lg border shadow-sm">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={tenant.image || undefined} />
                    <AvatarFallback className="text-3xl">
                        {tenant.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-grow">
                    <h1 className="text-4xl font-bold">{tenant.name}</h1>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground mt-2">
                        <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{tenant.email}</span>
                        {/* Hapa tungeongeza simu kama ipo kwenye 'User' model */}
                        {/* <span className="flex items-center gap-2"><Phone className="h-4 w-4" />{tenant.phone}</span> */}
                                        {/* <StartConversationButton tenantId={tenant.id} adminId={adminId} /> */}

                    </div>
                    {activeLease && (
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <Home className="h-4 w-4 text-primary" />
                            <span className="font-semibold">Current Residence:</span>
                            <Link href={`/admin/properties/${activeLease.room.property.id}`} className="hover:underline">
                                {activeLease.room.property.name}, Room {activeLease.room.roomNumber}
                            </Link>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0">
                    <Button className="gap-2">
                        <MessageSquare className="h-4 w-4" /> Start Conversation
                    </Button>
                </div>
            </header>
            
            {/* Tabs za Taarifa */}
            <Tabs defaultValue="lease" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="lease">Lease & Financials</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
                </TabsList>

                <TabsContent value="lease" className="mt-6">
                    <LeaseDetailsTab leases={tenant.leases} />
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                    <DocumentsTab documents={tenant.documents} />
                </TabsContent>

                <TabsContent value="maintenance" className="mt-6">
                    <MaintenanceTab tickets={tenant.maintenanceTickets} />
                </TabsContent>
            </Tabs>
        </div>
    );
}













