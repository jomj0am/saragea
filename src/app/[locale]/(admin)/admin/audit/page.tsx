// app/admin/audit-logs/page.tsx
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { formatDistanceToNow } from "date-fns";
import {
  ShieldAlert,
  Trash2,
  Edit,
  Plus,
  Settings,
  History,
  User,
  FileText,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Nodata } from "@/components/shared/Nodata";

// Get data directly since it's a server component
async function getLogs() {
  return prisma.auditLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, image: true } } },
  });
}

function getActionIcon(action: string) {
  switch (action) {
    case "DELETE":
      return <Trash2 className="w-4 h-4 text-red-500" />;
    case "UPDATE":
      return <Edit className="w-4 h-4 text-orange-500" />;
    case "CREATE":
      return <Plus className="w-4 h-4 text-emerald-500" />;
    case "SETTINGS_CHANGE":
      return <Settings className="w-4 h-4 text-blue-500" />;
    default:
      return <ShieldAlert className="w-4 h-4 text-purple-500" />;
  }
}

function getActionVariant(action: string) {
  switch (action) {
    case "DELETE":
      return "destructive";
    case "UPDATE":
      return "default";
    case "CREATE":
      return "success";
    case "SETTINGS_CHANGE":
      return "outline";
    default:
      return "secondary";
  }
}

export default async function AuditLogPage() {
  const logs = await getLogs();

  return (
    <div className="md:p-8 xl:p-12 space-y-6">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold tracking-tight">
          <div className="relative bg-purple-100/90 rounded-sm shadow-lg shadow-purple-500/70 dark:shadow-purple-700 p-1">
            <History className="h-9 w-9 text-purple-600 dark:text-purple-400" />
          </div>
          <span>
            <h1>Audit Logs</h1>
            <p className="text-[16px] font-light text-muted-foreground">
              Track critical system activities and security events.
            </p>
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Logs
              </p>
              <h3 className="text-2xl font-bold">{logs.length}</h3>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Creates
              </p>
              <h3 className="text-2xl font-bold">
                {logs.filter((l) => l.action === "CREATE").length}
              </h3>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <Plus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Updates
              </p>
              <h3 className="text-2xl font-bold">
                {logs.filter((l) => l.action === "UPDATE").length}
              </h3>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Edit className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-800 dark:to-gray-900 border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Deletes
              </p>
              <h3 className="text-2xl font-bold">
                {logs.filter((l) => l.action === "DELETE").length}
              </h3>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="shadow-lg border bg-background">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableHead className="w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 my-2 relative flex bg-gradient-to-br from-slate-400 dark:from-slate-700 to-slate-900 dark:border-slate-700/30 border rounded-full justify-center items-center">
                    <User className="text-purple-500 fill-purple-100" />
                  </div>
                  Actor
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 drop-shadow-sm dark:drop-shadow-md drop-shadow-black/80 text-red-500 fill-red-100" />
                  Action
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 drop-shadow-sm dark:drop-shadow-md drop-shadow-black/80 text-blue-500 fill-blue-100" />
                  Resource
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 drop-shadow-sm dark:drop-shadow-md drop-shadow-black/80 text-emerald-500 fill-emerald-100" />
                  Details
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Clock className="w-4 drop-shadow-sm dark:drop-shadow-md drop-shadow-black/80 text-gray-500 fill-gray-100" />
                  Time
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow
                key={log.id}
                className={
                  index % 2 === 0
                    ? "bg-background"
                    : "bg-muted/30 hover:bg-muted/50"
                }
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarImage src={log.user.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                        {log.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Admin
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <Badge variant={getActionVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {log.resource}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[300px]">
                  <div
                    className="text-sm text-muted-foreground truncate"
                    title={log.details}
                  >
                    {log.details}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {logs.length === 0 && (
          <div className="text-center p-10 text-muted-foreground bg-gradient-to-br from-bg-slate-50 via-white to-slate-200 dark:from-gray-800/50 dark:via-gray-400/10 dark:to-gray-700/50">
            <Nodata />
            No audit logs found.
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-gray-800/30 dark:to-gray-900/30 border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-purple-500 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">About Audit Logs</h4>
            <p className="text-sm text-muted-foreground">
              Audit logs track all critical administrative actions within the
              system. Each entry includes the actor, action type, affected
              resource, and timestamp. This helps with security monitoring,
              compliance, and troubleshooting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
