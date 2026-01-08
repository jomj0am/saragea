"use client";

import { useState } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Wrench,
  Home,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Added Avatar imports
import TicketList from "./TicketList";
import NewTicketDialog from "./NewTicketDialog";
import PaymentDialog from "./PaymentDialog";
import Link from "next/link";
import { motion } from "framer-motion";
import NotificationBell from "../shared/NotificationBell";
import {
  Lease,
  Room,
  Property,
  Invoice,
  MaintenanceTicket,
  Role,
} from "@prisma/client";

type InvoiceWithLease = Invoice & {
  lease: Lease & {
    room: Room;
  };
};

// Define the shape of the data prop
interface DashboardData {
  activeLease: (Lease & { room: Room & { property: Property } }) | null;
  tickets: MaintenanceTicket[];
  invoices: InvoiceWithLease[];
}

// Define the component props
interface DashboardClientProps {
  user: {
    id: string;
    role: Role;
    name?: string | null;   
    email?: string | null;
    image?: string | null;  
  };  
  data: DashboardData;
  paymentStatus?: string;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function DashboardClient({
  user,
  data,
  paymentStatus,
}: DashboardClientProps) {
  // ✅ Fixed any in signature

  const { activeLease, tickets, invoices } = data;

  // TypeScript now knows 'inv' is an 'InvoiceWithLease'
  const dueInvoices = invoices.filter(
    (inv) => inv.status === "DUE" || inv.status === "OVERDUE"
  );

  const paidInvoices = invoices.filter((inv) => inv.status === "PAID");

  const actions = [
    { label: "My Home", icon: Home, color: "bg-blue-500", onClick: () => {} },
    {
      label: "Pay Rent",
      icon: CreditCard,
      color: "bg-emerald-500",
      tab: "payments",
    },
    {
      label: "Report Issue",
      icon: Wrench,
      color: "bg-orange-500",
      tab: "maintenance",
    },
    {
      label: "Messages",
      icon: MessageCircle,
      color: "bg-purple-500",
      link: "/dashboard/messages",
    },
  ];

  const [activeTab, setActiveTab] = useState("overview");

  return (
    // Added overflow-x-hidden to the main wrapper to prevent horizontal scroll issues
    <div className="space-y-8 max-w-5xl mx-auto pb-20 overflow-x-hidden w-full">
      {/* 1. Header Section with Avatar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-14 w-14 border-2 border-primary/10 shadow-sm">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || "user avatar"}
            />
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {getGreeting()}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground line-clamp-1">
              {user.name?.split(" ")?.[0] || "User"}
              {/* Show first name for cleaner look on mobile */}
            </h1>
          </div>
        </div>

        {/* Notification Bell */}
        <NotificationBell />
      </div>

      {/* Payment Success/Fail Alert */}
      {paymentStatus === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200 rounded-xl shadow-sm">
            <CheckCircle2 className="h-5 w-5" />
            <AlertTitle className="font-bold">Payment Successful!</AlertTitle>
            <AlertDescription>
              Your payment has been verified and your balance updated.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* 2. Gradient Banner (CTA style) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-6 sm:p-10 text-white shadow-2xl shadow-indigo-500/20"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            {activeLease ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white/90 border border-white/10">
                  <Home className="w-3 h-3" /> Resident
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                  {activeLease.room.property.name}
                </h2>
                <p className="text-indigo-100 text-base md:text-lg opacity-90">
                  Room {activeLease.room.roomNumber}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">
                  Find your dream home
                </h2>
                <p className="text-indigo-100 mb-4 max-w-md text-sm md:text-base">
                  Browse our premium listings and start your application today.
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="rounded-full px-6 font-bold shadow-lg"
                >
                  <Link href="/properties">
                    Browse Properties <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {activeLease &&
            (dueInvoices.length > 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 w-full sm:w-auto min-w-[240px] shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wider text-indigo-200 font-bold">
                    Total Due
                  </p>
                  <Badge variant="destructive" className="animate-pulse">
                    Action Required
                  </Badge>
                </div>
                <p className="text-3xl font-bold tracking-tight mb-4">
                  {formatCurrency(
                    dueInvoices.reduce(
                      (acc: number, inv) => acc + inv.amount,
                      0
                    )
                  )}
                </p>
                <div className="w-full">
                  <PaymentDialog invoice={dueInvoices[0]} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-emerald-500/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-400/30 w-full sm:w-auto">
                <div className="p-2 bg-emerald-500 rounded-full text-white shadow-lg shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">All caught up!</p>
                  <p className="text-xs text-emerald-100">
                    Next rent due next month
                  </p>
                </div>
              </div>
            ))}
        </div>
      </motion.div>

      {/* 3. Category Icons (Mobile Navigation) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-6">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => (action.tab ? setActiveTab(action.tab) : null)}
            className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-muted/50 transition-colors group"
          >
            <div
              className={`${action.color} p-3 md:p-4 rounded-2xl shadow-md text-white ring-4 ring-transparent group-hover:ring-muted transition-all`}
            >
              {action.link ? (
                <Link href={action.link}>
                  <action.icon className="h-5 w-5 md:h-6 md:w-6" />
                </Link>
              ) : (
                <action.icon className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors text-center leading-tight">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* 4. Tabbed Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <div className="flex justify-center w-full overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="bg-muted/50 p-1 rounded-full border inline-flex w-auto min-w-full sm:min-w-fit">
            <TabsTrigger
              value="overview"
              className="rounded-full px-4 sm:px-6 flex-1 sm:flex-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="rounded-full px-4 sm:px-6 flex-1 sm:flex-none"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="rounded-full px-4 sm:px-6 flex-1 sm:flex-none"
            >
              Maintenance
            </TabsTrigger>
          </TabsList>
        </div>

        {/* OVERVIEW TAB */}
        <TabsContent
          value="overview"
          className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Card */}
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dueInvoices.length > 0 ? (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-background p-4 rounded-xl border border-dashed gap-4">
                    <div>
                      <p className="font-bold text-xl">
                        {formatCurrency(dueInvoices[0].amount)}
                      </p>
                      <p className="text-sm text-red-500 font-medium mt-1">
                        Due{" "}
                        {format(
                          new Date(dueInvoices[0].dueDate),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                    <div className="w-full sm:w-auto">
                      <PaymentDialog invoice={dueInvoices[0]} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                    </div>
                    <p>No upcoming payments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Maintenance Card */}
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-500" /> Maintenance
                </CardTitle>
                {activeLease && <NewTicketDialog lease={activeLease} />}
              </CardHeader>
              <CardContent>
                {tickets.length > 0 ? (
                  <div className="bg-background p-4 rounded-xl border border-dashed">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold truncate max-w-[150px] sm:max-w-[200px]">
                        {tickets[0].title}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {format(new Date(tickets[0].createdAt), "MMM dd")}
                      </span>
                    </div>
                    <Badge
                      variant={
                        tickets[0].status === "RESOLVED"
                          ? "success"
                          : "secondary"
                      }
                      className="w-fit"
                    >
                      {tickets[0].status}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-8 text-center">
                    No active maintenance requests.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs remain identical to previous logic, they are safe from overflow due to main wrapper */}
        {/* PAYMENTS TAB */}
        <TabsContent
          value="payments"
          className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        >
          {/* Unpaid Invoices List */}
          {dueInvoices.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" /> Action Required
              </h3>
              {dueInvoices.map((inv) => (
                <Card
                  key={inv.id}
                  className="border-l-4 border-l-red-500 shadow-md overflow-hidden"
                >
                  <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-xl">
                        {formatCurrency(inv.amount)}
                      </p>
                      <p className="text-sm text-red-600 font-medium">
                        Due {format(new Date(inv.dueDate), "PPP")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Invoice #{inv.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                    <div className="w-full sm:w-auto">
                      <PaymentDialog invoice={inv} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Payment History */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Secure record of your rent payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {paidInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Rent Payment</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(inv.dueDate), "MMMM yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-sm hidden sm:block">
                        {formatCurrency(inv.amount)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-9 rounded-lg"
                        asChild
                      >
                        <Link
                          href={`/api/receipts/${inv.paymentId}`}
                          target="_blank"
                        >
                          <Download className="h-3.5 w-3.5" />{" "}
                          <span className="hidden sm:inline">Receipt</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {paidInvoices.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No payment history found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="maintenance"
          className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div>
              <h3 className="font-bold text-xl">Maintenance Requests</h3>
              <p className="text-muted-foreground text-sm">
                Track repairs and property issues.
              </p>
            </div>
            {activeLease && <NewTicketDialog lease={activeLease} />}
          </div>
          <TicketList tickets={tickets} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
